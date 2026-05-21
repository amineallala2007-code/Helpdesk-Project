<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketMessage extends Model
{
    use HasFactory;

    protected $fillable = ['ticket_id', 'author_id', 'body'];

    public function ticket() { return $this->belongsTo(Ticket::class); }
    public function author() { return $this->belongsTo(User::class, 'author_id'); }
}
