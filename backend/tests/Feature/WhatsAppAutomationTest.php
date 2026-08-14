<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WhatsappAccount;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WhatsAppAutomationTest extends TestCase
{
    use RefreshDatabase;

    protected function admin(): User
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $admin = User::factory()->create(['is_active' => true]);
        $admin->assignRole('admin');

        return $admin;
    }

    public function test_admin_can_create_a_whatsapp_number_and_receives_its_qr_code(): void
    {
        Http::fake([
            'wzila.com/whatsapp/api/get_instance_id.php*' => Http::response([
                'instance_id' => 'inst-123',
                'access_token' => 'secret-token-abc',
            ]),
            'apis.wzila.com/get_qrcode*' => Http::response(['qrcode' => 'data:image/png;base64,FAKE']),
        ]);

        $response = $this->actingAs($this->admin())
            ->postJson('/api/whatsapp/accounts', ['label' => 'School Main Line']);

        $response->assertCreated();
        $response->assertJsonPath('data.label', 'School Main Line');
        $response->assertJsonPath('data.instance_id', 'inst-123');
        $response->assertJsonPath('qrcode.qrcode', 'data:image/png;base64,FAKE');
        $response->assertJsonMissingPath('data.access_token');

        Http::assertSent(fn ($request) => str_contains($request->url(), 'get_instance_id.php'));
        Http::assertSent(fn ($request) => str_contains($request->url(), 'get_qrcode')
            && $request['instance_id'] === 'inst-123'
            && $request['access_token'] === 'secret-token-abc');

        $this->assertDatabaseHas('whatsapp_accounts', ['label' => 'School Main Line', 'instance_id' => 'inst-123']);
    }

    public function test_broadcast_send_targets_only_the_requested_subject_and_skips_teachers_without_a_phone(): void
    {
        Http::fake([
            'apis.wzila.com/send-link*' => Http::response(['status' => 'sent']),
        ]);

        $admin = $this->admin();
        $account = WhatsappAccount::query()->create([
            'label' => 'Main',
            'instance_id' => 'inst-1',
            'access_token' => 'tok-1',
            'is_active' => true,
            'created_by' => $admin->id,
        ]);

        $mathsWithPhone = User::factory()->create(['subject' => 'maths', 'phone' => '01012345678']);
        $mathsWithPhone->assignRole('teacher');

        $mathsNoPhone = User::factory()->create(['subject' => 'maths', 'phone' => null]);
        $mathsNoPhone->assignRole('teacher');

        $scienceWithPhone = User::factory()->create(['subject' => 'science', 'phone' => '01098765432']);
        $scienceWithPhone->assignRole('teacher');

        $response = $this->actingAs($admin)->postJson('/api/whatsapp/send', [
            'account_id' => $account->id,
            'message' => 'Hello Maths teachers!',
            'audience' => 'subject',
            'subject' => 'maths',
        ]);

        $response->assertOk();
        $response->assertJson(['sent' => 1, 'failed' => 0, 'skipped_no_phone' => 1]);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'send-link')
                && str_contains($request->url(), 'chat_id=201012345678%40s.whatsapp.net');
        });
        Http::assertNotSent(fn ($request) => str_contains($request->url(), '201098765432'));
    }

    public function test_non_admin_cannot_reach_whatsapp_endpoints(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $teacher = User::factory()->create();
        $teacher->assignRole('teacher');

        $this->actingAs($teacher)->getJson('/api/whatsapp/accounts')->assertForbidden();
    }
}
