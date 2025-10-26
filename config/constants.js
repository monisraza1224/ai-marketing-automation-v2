module.exports = {
  // ... existing constants ...

  // GHL Configuration
  GHL_WEBHOOK_EVENTS: {
    CONTACT_ADDED: 'contactAdded',
    CONTACT_UPDATED: 'contactUpdated', 
    CONTACT_NOTE_ADDED: 'contactNoteAdded',
    EMAIL_OPENED: 'emailOpened',
    LINK_CLICKED: 'linkClicked',
    FORM_SUBMITTED: 'formSubmitted',
    APPOINTMENT_BOOKED: 'appointmentBooked'
  },

  // GHL Pipeline Stages (customize based on your setup)
  GHL_PIPELINE_STAGES: {
    NEW_LEAD: 'New Lead',
    CONTACTED: 'Contacted',
    QUALIFIED: 'Qualified',
    PROPOSAL: 'Proposal',
    NEGOTIATION: 'Negotiation',
    CLOSED_WON: 'Closed Won',
    CLOSED_LOST: 'Closed Lost'
  }
};
