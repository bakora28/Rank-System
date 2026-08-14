<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Thin wrapper around GREEN-API (green-api.com). Instances are created and
 * authorized entirely in the provider's own console — this app only ever
 * consumes the three access parameters (apiUrl, idInstance, apiTokenInstance)
 * an admin copies in from there.
 */
class WhatsAppService
{
    /**
     * Fetches the QR code payload the admin scans to link a WhatsApp number.
     *
     * @return array{type: string, message?: string}
     */
    public function getQrCode(string $apiUrl, string $instanceId, string $accessToken): array
    {
        $response = Http::timeout(15)->get(rtrim($apiUrl, '/')."/waInstance{$instanceId}/qr/{$accessToken}");

        if ($response->failed()) {
            throw new RuntimeException('Could not fetch the QR code from the WhatsApp provider.');
        }

        return $response->json() ?? [];
    }

    /**
     * Sends a single WhatsApp text message.
     *
     * @param  string  $chatId  e.g. "201025385693@c.us"
     */
    public function sendMessage(string $apiUrl, string $instanceId, string $accessToken, string $chatId, string $text): bool
    {
        $response = Http::timeout(20)
            ->post(rtrim($apiUrl, '/')."/waInstance{$instanceId}/sendMessage/{$accessToken}", [
                'chatId' => $chatId,
                'message' => $text,
            ]);

        return $response->successful();
    }

    /**
     * Converts a local Egyptian mobile number (e.g. "01012345678") into
     * GREEN-API's chat_id format (e.g. "201012345678@c.us").
     */
    public function toChatId(string $localPhone): string
    {
        $digits = preg_replace('/\D/', '', $localPhone);
        $withoutLeadingZero = ltrim($digits, '0');

        return '20'.$withoutLeadingZero.'@c.us';
    }
}
