<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_id', 'assignee_id', 'category_id', 'priority_id', 
        'title', 'description', 'status', 'resolved_at', 'closed_at','agent_id',
    ];

    public function requester() { return $this->belongsTo(User::class, 'requester_id'); }
    public function assignee() { return $this->belongsTo(User::class, 'assignee_id'); }
    public function category() { return $this->belongsTo(Category::class); }
    public function priority() { return $this->belongsTo(Priority::class); }
    public function messages() { return $this->hasMany(TicketMessage::class); }
    public function attachments() { return $this->hasMany(Attachment::class); }

    public function agent() {return $this->belongsTo(User::class, 'agent_id');}
}
