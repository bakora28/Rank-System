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

    public function test_admin_can_create_a_whatsapp_number_with_its_access_parameters_and_receives_its_qr_code(): void
    {
        Http::fake([
            'https://1234.api.green-api.com/waInstance1234/qr/secret-token-abc' => Http::response([
                'type' => 'qrCode',
                'message' => 'FAKEBASE64',
            ]),
        ]);

        $response = $this->actingAs($this->admin())->postJson('/api/whatsapp/accounts', [
            'label' => 'School Main Line',
            'api_url' => 'https://1234.api.green-api.com',
            'instance_id' => '1234',
            'access_token' => 'secret-token-abc',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.label', 'School Main Line');
        $response->assertJsonPath('data.instance_id', '1234');
        $response->assertJsonPath('data.api_url', 'https://1234.api.green-api.com');
        $response->assertJsonPath('qrcode.message', 'FAKEBASE64');
        $response->assertJsonMissingPath('data.access_token');

        Http::assertSent(fn ($request) => str_contains($request->url(), '/waInstance1234/qr/secret-token-abc'));

        $this->assertDatabaseHas('whatsapp_accounts', ['label' => 'School Main Line', 'instance_id' => '1234']);
    }

    public function test_broadcast_send_targets_only_the_requested_subject_and_skips_teachers_without_a_phone(): void
    {
        Http::fake([
            'https://1234.api.green-api.com/waInstance1234/sendMessage/tok-1' => Http::response(['idMessage' => 'abc']),
        ]);

        $admin = $this->admin();
        $account = WhatsappAccount::query()->create([
            'label' => 'Main',
            'api_url' => 'https://1234.api.green-api.com',
            'instance_id' => '1234',
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
            return str_contains($request->url(), '/sendMessage/')
                && $request['chatId'] === '201012345678@c.us';
        });
        Http::assertNotSent(fn ($request) => ($request['chatId'] ?? null) === '201098765432@c.us');
    }

    public function test_non_admin_cannot_reach_whatsapp_endpoints(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $teacher = User::factory()->create();
        $teacher->assignRole('teacher');

        $this->actingAs($teacher)->getJson('/api/whatsapp/accounts')->assertForbidden();
    }
}
