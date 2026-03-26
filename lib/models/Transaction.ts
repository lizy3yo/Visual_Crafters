import mongoose, { Schema, model, models } from 'mongoose';

/**
 * Transaction – records a completed payment from a client.
 *
 * Indexes:
 *   • date           – fast range queries for daily / weekly / monthly totals
 *   • client         – lookups by client name
 *   • (date, client) – compound for filtered summaries
 *   • createdAt      – default sort
 */
const transactionSchema = new Schema(
  {
    client:   { type: String, required: true, trim: true, maxlength: 150 },
    service:  { type: String, required: true, trim: true, maxlength: 150 },
    template: { type: String, trim: true, maxlength: 150, default: '' },
    payment:  { type: String, enum: ['QR', 'Cash'], required: true },
    amount:   { type: Number, required: true, min: 0 },
    date:     { type: String, required: true }, // stored as 'YYYY-MM-DD'
    notes:    { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
transactionSchema.index({ date: -1 });
transactionSchema.index({ client: 1 });
transactionSchema.index({ date: -1, client: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = models.Transaction ?? model('Transaction', transactionSchema);
export default Transaction;
