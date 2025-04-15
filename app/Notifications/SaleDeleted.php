<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Telegram\TelegramMessage;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;

class SaleDeleted extends Notification
{
    use Queueable;

    public $sale;
    protected $botToken;
    /**
     * Create a new notification instance.
     */
    public function __construct($sale, $botToken='')
    {
        $this->botToken = $botToken;
        $this->sale = $sale;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'telegram'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Sale Deleted - #' . $this->sale['invoice_number'])
            ->greeting('A sale has been deleted.')
            ->line('#' . $this->sale['invoice_number'].' By '.Auth::user()->name)
            ->line('Amount: ' . $this->sale['total_amount'])
            ->line('Deleted at: ' . \Carbon\Carbon::parse($this->sale['deleted_at'])->format('Y-m-d h:i A'));
    }

    public function toDatabase($notifiable)
    {
        return [
            'sale_id' => $this->sale['id'],
            'amount' => $this->sale['total_amount'],
            'message' => 'A sale has been deleted.',
            'url' => url('/sales'),
        ];
    }

    public function toTelegram($notifiable)
    {
        // Create the Telegram message
        return TelegramMessage::create()
            ->content(
                "A sale has been deleted.\n" .
                "Invoice Number: #" . $this->sale['invoice_number'] . "\n" .
                "Deleted By: " . Auth::user()->name . "\n" .
                "Amount: " . $this->sale['total_amount'] . "\n" .
                "Deleted at: " . \Carbon\Carbon::parse($this->sale['deleted_at'])->format('Y-m-d h:i A') . "\n"
            )
            ->token($this->botToken);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
