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
     * Auto-generates a fresh Wzila instance_id for a new number.
     */
    public function newInstance()
    {
        try {
            return response()->json(['instance_id' => $this->whatsApp->createInstanceId()]);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }
    }

    /**
     * Saves a WhatsApp number using an instance_id (auto-generated via
     * newInstance()) paired with the admin's Wzila account access_token,
     * then returns its QR code so the admin can scan it immediately.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'instance_id' => ['required', 'string'],
            'access_token' => ['required', 'string'],
        ]);

        $account = WhatsappAccount::query()->create([
            'label' => $data['label'],
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
            return $this->whatsApp->getQrCode($account->instance_id, $account->access_token);
        } catch (RuntimeException) {
            return null;
        }
    }
}
