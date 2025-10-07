// utils/conversationTree.js
// Simplified conversation tree - place in: frontend/utils/conversationTree.js

export const conversationTree = {
  // Starting point - Inquirer's first options
  START: {
    role: 'inquirer',
    options: [
      { id: 'ask_availability', text: 'Is it available?', next: 'AVAILABILITY_RESPONSE' },
      { id: 'ask_price', text: 'Can you negotiate the price?', next: 'PRICE_RESPONSE' },
      { id: 'ask_visit', text: 'Can I schedule a visit?', next: 'VISIT_RESPONSE' },
      { id: 'ask_contact', text: 'Please share your contact info', next: 'CONTACT_RESPONSE' }
    ]
  },

  // ========== AVAILABILITY BRANCH ==========
  AVAILABILITY_RESPONSE: {
    role: 'owner',
    options: [
      { id: 'yes_available', text: 'Yes, it\'s available now', next: 'AFTER_AVAILABLE_YES' },
      { id: 'not_available', text: 'Sorry, it\'s booked', next: 'END_CONVERSATION' }
    ]
  },
  
  AFTER_AVAILABLE_YES: {
    role: 'inquirer',
    options: [
      { id: 'great_visit', text: 'Great! Can I visit?', next: 'VISIT_RESPONSE' },
      { id: 'negotiate_price', text: 'Can we discuss the price?', next: 'PRICE_RESPONSE' },
      { id: 'need_contact', text: 'Share your contact details', next: 'CONTACT_RESPONSE' }
    ]
  },

  // ========== PRICE NEGOTIATION BRANCH ==========
  PRICE_RESPONSE: {
    role: 'owner',
    options: [
      { id: 'price_flexible', text: 'Yes, we can discuss', next: 'AFTER_PRICE_FLEXIBLE' },
      { id: 'price_fixed', text: 'Sorry, price is fixed', next: 'AFTER_PRICE_FIXED' }
    ]
  },

  AFTER_PRICE_FLEXIBLE: {
    role: 'inquirer',
    options: [
      { id: 'accept_discuss', text: 'Sounds good, what\'s your number?', next: 'CONTACT_RESPONSE' },
      { id: 'not_interested', text: 'Let me think about it', next: 'END_CONVERSATION' }
    ]
  },

  AFTER_PRICE_FIXED: {
    role: 'inquirer',
    options: [
      { id: 'accept_price', text: 'Okay, I\'ll take it', next: 'BOOKING_PROCESS' },
      { id: 'not_affordable', text: 'That\'s too high for me', next: 'END_CONVERSATION' }
    ]
  },

  // ========== VISIT SCHEDULING BRANCH ==========
  VISIT_RESPONSE: {
    role: 'owner',
    options: [
      { id: 'yes_visit', text: 'Sure! When works for you?', next: 'VISIT_TIME_SUGGEST' },
      { id: 'not_possible', text: 'Visits not possible right now', next: 'AFTER_NO_VISIT' }
    ]
  },

  VISIT_TIME_SUGGEST: {
    role: 'inquirer',
    options: [
      { id: 'weekend', text: 'This weekend?', next: 'VISIT_CONFIRM' },
      { id: 'weekday', text: 'Any weekday evening?', next: 'VISIT_CONFIRM' }
    ]
  },

  VISIT_CONFIRM: {
    role: 'owner',
    options: [
      { id: 'time_works', text: 'Yes, that works!', next: 'AFTER_VISIT_SCHEDULED' },
      { id: 'suggest_other', text: 'How about Saturday 3pm?', next: 'VISIT_ALTERNATE' }
    ]
  },

  VISIT_ALTERNATE: {
    role: 'inquirer',
    options: [
      { id: 'alternate_ok', text: 'Perfect! See you then', next: 'AFTER_VISIT_SCHEDULED' },
      { id: 'alternate_not_ok', text: 'Can\'t make that time', next: 'END_CONVERSATION' }
    ]
  },

  AFTER_VISIT_SCHEDULED: {
    role: 'inquirer',
    options: [
      { id: 'get_contact', text: 'Share your contact please', next: 'CONTACT_RESPONSE' },
      { id: 'all_set_visit', text: 'All set, thanks!', next: 'END_CONVERSATION' }
    ]
  },

  AFTER_NO_VISIT: {
    role: 'inquirer',
    options: [
      { id: 'ok_no_visit', text: 'Okay, let\'s finalize then', next: 'BOOKING_PROCESS' },
      { id: 'must_visit', text: 'I need to visit before deciding', next: 'END_CONVERSATION' }
    ]
  },

  // ========== CONTACT EXCHANGE BRANCH ==========
  CONTACT_RESPONSE: {
    role: 'owner',
    options: [
      { id: 'share_contact', text: 'Sure: +91 98765 43210', next: 'AFTER_OWNER_CONTACT' },
      { id: 'ask_inquirer_contact', text: 'Can you share yours first?', next: 'INQUIRER_CONTACT' }
    ]
  },

  INQUIRER_CONTACT: {
    role: 'inquirer',
    options: [
      { id: 'share_my_contact', text: 'Sure: +91 98765 12345', next: 'AFTER_INQUIRER_CONTACT' },
      { id: 'privacy_concern', text: 'Can we finalize here first?', next: 'BOOKING_PROCESS' }
    ]
  },

  AFTER_OWNER_CONTACT: {
    role: 'inquirer',
    options: [
      { id: 'will_call', text: 'Got it! I\'ll call you', next: 'END_CONVERSATION' },
      { id: 'whatsapp_ok', text: 'Can I WhatsApp?', next: 'CONTACT_CONFIRM' }
    ]
  },

  CONTACT_CONFIRM: {
    role: 'owner',
    options: [
      { id: 'yes_whatsapp', text: 'Yes, WhatsApp is fine', next: 'END_CONVERSATION' },
      { id: 'call_better', text: 'Call is better', next: 'END_CONVERSATION' }
    ]
  },

  AFTER_INQUIRER_CONTACT: {
    role: 'owner',
    options: [
      { id: 'will_reach', text: 'Thanks! I\'ll contact you soon', next: 'END_CONVERSATION' }
    ]
  },

  // ========== BOOKING PROCESS ==========
  BOOKING_PROCESS: {
    role: 'owner',
    options: [
      { id: 'need_advance', text: 'Need advance payment', next: 'ADVANCE_DISCUSS' },
      { id: 'schedule_signing', text: 'When can we sign the agreement?', next: 'SIGNING_SCHEDULE' }
    ]
  },

  ADVANCE_DISCUSS: {
    role: 'inquirer',
    options: [
      { id: 'how_much', text: 'How much advance?', next: 'ADVANCE_AMOUNT' },
      { id: 'ready_pay', text: 'I\'m ready, send your details', next: 'CONTACT_RESPONSE' }
    ]
  },

  ADVANCE_AMOUNT: {
    role: 'owner',
    options: [
      { id: 'one_month', text: 'One month rent as advance', next: 'ADVANCE_CONFIRM' },
      { id: 'two_months', text: 'Two months security deposit', next: 'ADVANCE_CONFIRM' }
    ]
  },

  ADVANCE_CONFIRM: {
    role: 'inquirer',
    options: [
      { id: 'accept_advance', text: 'Okay, that works', next: 'CONTACT_RESPONSE' },
      { id: 'too_much', text: 'That\'s too much for me', next: 'END_CONVERSATION' }
    ]
  },

  SIGNING_SCHEDULE: {
    role: 'inquirer',
    options: [
      { id: 'sign_today', text: 'Can we sign today?', next: 'SIGNING_CONFIRM' },
      { id: 'sign_weekend', text: 'This weekend works', next: 'SIGNING_CONFIRM' }
    ]
  },

  SIGNING_CONFIRM: {
    role: 'owner',
    options: [
      { id: 'signing_ok', text: 'Yes, let\'s finalize!', next: 'CONTACT_RESPONSE' },
      { id: 'different_time', text: 'How about Monday?', next: 'SIGNING_ALTERNATE' }
    ]
  },

  SIGNING_ALTERNATE: {
    role: 'inquirer',
    options: [
      { id: 'monday_ok', text: 'Monday works for me', next: 'CONTACT_RESPONSE' },
      { id: 'monday_not_ok', text: 'Can\'t do Monday', next: 'END_CONVERSATION' }
    ]
  },

  // ========== END STATE ==========
  END_CONVERSATION: {
    role: 'both',
    options: [
      { id: 'restart', text: 'Ask something else', next: 'START' },
      { id: 'goodbye', text: 'Thank you, goodbye!', next: 'END_CONVERSATION' }
    ]
  }
};

// Helper function to get next options based on current state and user role
export function getNextOptions(currentState, userRole, tree = conversationTree) {
  const state = tree[currentState];
  
  if (!state) {
    return { canReply: false, options: [], waitingFor: null };
  }
  
  // If state is for 'both' roles or matches user's role
  const canReply = state.role === 'both' || state.role === userRole;
  
  return {
    canReply,
    options: canReply ? state.options : [],
    waitingFor: !canReply ? state.role : null
  };
}