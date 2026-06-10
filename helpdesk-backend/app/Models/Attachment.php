<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    protected $fillable = [
        'ticket_id',
        'message_id',
        'path',
        'original_name',
        'mime',
        'size',
    ];

    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        return rtrim(request()->getSchemeAndHttpHost(), '/') . '/storage/' . ltrim($this->path, '/');
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function message()
    {
        return $this->belongsTo(TicketMessage::class, 'message_id');
    }
}
