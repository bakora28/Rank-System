<?php

namespace App\Http\Controllers;

use App\Http\Resources\WhatsappAccountResource;
use App\Models\WhatsappAccount;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use RuntimeException;

class WhatsappAccountController extends Controller
{
    public function __construct(protected WhatsAppService $whatsApp)
    {
    }

    public function index()
    {
        return WhatsappAccountResource::collection(
            WhatsappAccount::query()->orderBy('label')->get()
        );
    }

    /**
     * Saves a WhatsApp number using the access parameters (apiUrl, idInstance,
     * apiTokenInstance) an admin copies from their own GREEN-API console,
     * then returns its QR code so the admin can scan it immediately.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'api_url' => ['required', 'string', 'url', 'max:255'],
            'instance_id' => ['required', 'string'],
            'access_token' => ['required', 'string'],
        ]);

        $account = WhatsappAccount::query()->create([
            'label' => $data['label'],
            'api_url' => rtrim($data['api_url'], '/'),
            'instance_id' => $data['instance_id'],
            'access_token' => $data['access_token'],
            'is_active' => true,
            'created_by' => $request->user()->id,
        ]);

        $qrcode = $this->tryGetQrCode($account);

        return response()->json([
            'data' => new WhatsappAccountResource($account),
            'qrcode' => $qrcode,
        ], 201);
    }

    /**
     * Re-fetches the QR code for an existing number (e.g. if it expired
     * before the admin scanned it, or the number needs to be re-linked).
     */
    public function qrcode(WhatsappAccount $whatsappAccount)
    {
        return response()->json(['qrcode' => $this->tryGetQrCode($whatsappAccount)]);
    }

    public function update(Request $request, WhatsappAccount $whatsappAccount)
    {
        $data = $request->validate([
            'label' => ['sometimes', 'string', 'max:255'],
            'api_url' => ['sometimes', 'string', 'url', 'max:255'],
            'instance_id' => ['sometimes', 'string'],
            'access_token' => ['sometimes', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $whatsappAccount->update($data);

        return new WhatsappAccountResource($whatsappAccount);
    }

    public function destroy(WhatsappAccount $whatsappAccount)
    {
        $whatsappAccount->delete();

        return response()->noContent();
    }

    protected function tryGetQrCode(WhatsappAccount $account): ?array
    {
        try {
            return $this->whatsApp->getQrCode($account->api_url, $account->instance_id, $account->access_token);
        } catch (RuntimeException) {
            return null;
        }
    }
}
