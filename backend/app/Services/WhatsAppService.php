<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class WhatsAppService
{
    /**
     * Calls Wzila's instance-creation endpoint and returns the fresh
     * [instance_id, access_token] pair for a brand new WhatsApp number.
     *
     * @return array{instance_id: string, access_token: string}
     */
    public function createInstance(): array
    {
        $response = Http::timeout(15)->get(config('services.wzila.instance_url'));

        if ($response->failed()) {
            throw new RuntimeException('Could not reach the WhatsApp provider to create a new instance.');
        }

        $data = $response->json();
        $instanceId = $data['instance_id'] ?? null;
        $accessToken = $data['access_token'] ?? null;

        if (! $instanceId || ! $accessToken) {
            throw new RuntimeException('The WhatsApp provider did not return an instance_id/access_token.');
        }

        return ['instance_id' => $instanceId, 'access_token' => $accessToken];
    }

    /**
     * Fetches the QR code payload the admin scans to link a WhatsApp number.
     */
    public function getQrCode(string $instanceId, string $accessToken): array
    {
        $response = Http::timeout(15)->get(config('services.wzila.api_url').'/get_qrcode', [
            'access_token' => $accessToken,
            'instance_id' => $instanceId,
        ]);

        if ($response->failed()) {
            throw new RuntimeException('Could not fetch the QR code from the WhatsApp provider.');
        }

        return $response->json() ?? [];
    }

    /**
     * Sends a single WhatsApp text message.
     *
     * @param  string  $chatId  e.g. "201025385693@s.whatsapp.net"
     */
    public function sendMessage(string $instanceId, string $accessToken, string $chatId, string $text): bool
    {
        // Wzila documents this as a POST whose parameters travel in the query
        // string (their own examples show them appended to the URL), so we
        // mirror that exactly rather than sending a JSON/form body.
        $query = http_build_query([
            'access_token' => $accessToken,
            'instance_id' => $instanceId,
            'chat_id' => $chatId,
            'text' => $text,
        ]);

        $response = Http::timeout(20)->post(config('services.wzila.api_url')."/send-link?{$query}");

        return $response->successful();
    }

    /**
     * Converts a local Egyptian mobile number (e.g. "01012345678") into the
     * Wzila chat_id format (e.g. "201012345678@s.whatsapp.net").
     */
    public function toChatId(string $localPhone): string
    {
        $digits = preg_replace('/\D/', '', $localPhone);
        $withoutLeadingZero = ltrim($digits, '0');

        return '20'.$withoutLeadingZero.'@s.whatsapp.net';
    }
}
