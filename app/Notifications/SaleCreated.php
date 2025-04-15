<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Telegram\TelegramMessage;
use App\Models\Setting;

class SaleCreated extends Notification
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
            ->subject('New Sale Created - #' . $this->sale['invoice_number'])
            ->greeting('A new sale has been created.')
            ->line('#' . $this->sale['invoice_number'].' By '.$this->sale['created_by'])
            ->line('Amount: ' . $this->sale['total_amount'])
            ->line('Created at: ' . \Carbon\Carbon::parse($this->sale['created_at'])->format('Y-m-d h:i A'))
            ->action('View Sale', url('/receipt/' . $this->sale['id']));
    }

    public function toDatabase($notifiable)
    {
        return [
            'sale_id' => $this->sale['id'],
            'amount' => $this->sale['total_amount'],
            'message' => 'A new sale has been created.',
            'url' => url('/sales/' . $this->sale['id']),
        ];
    }

    // public function toTelegram($notifiable)
    // {
    //     $message = "A new sale has been created.\n";
    //     $message .= "Invoice Number: #" . $this->sale['invoice_number'] . "\n";
    //     $message .= "Created By: " . $this->sale['created_by'] . "\n";
    //     $message .= "Amount: " . $this->sale['total_amount'] . "\n";
    //     $message .= "Created at: " . \Carbon\Carbon::parse($this->sale['created_at'])->format('Y-m-d h:i A') . "\n";
    //     $message .= "View Sale: " . url('/sales/' . $this->sale['id']);

    //     return $message;
    // }

    public function toTelegram($notifiable)
    {
        // Create the Telegram message
        return TelegramMessage::create()
            ->content(
                "A new sale has been created.\n" .
                "Invoice Number: #" . $this->sale['invoice_number'] . "\n" .
                "Created By: " . $this->sale['created_by'] . "\n" .
                "Amount: " . $this->sale['total_amount'] . "\n" .
                "Created at: " . \Carbon\Carbon::parse($this->sale['created_at'])->format('Y-m-d h:i A') . "\n"
            )
            ->token($this->botToken)
            ->button('View Sale', url('/receipt/'.$this->sale['id']));  // Optional button to view the sale
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
