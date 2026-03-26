import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IReservation extends Document {
  clientName:  string;
  contact:     string;
  email:       string;
  service:     string;
  date:        string; // YYYY-MM-DD
  timeSlot:    string; // e.g. "9:00 AM"
  notes?:      string;
  status:      'Scheduled' | 'Serving' | 'Done' | 'Cancelled';
  createdAt:   Date;
  updatedAt:   Date;
}

const ReservationSchema = new Schema<IReservation>(
  {
    clientName: { type: String, required: true, trim: true, maxlength: 100 },
    contact:    { type: String, required: true, trim: true, maxlength: 30  },
    email:      { type: String, required: true, trim: true, lowercase: true },
    service:    { type: String, required: true, trim: true },
    date:       { type: String, required: true },
    timeSlot:   { type: String, required: true },
    notes:      { type: String, trim: true, maxlength: 500 },
    status: {
      type:    String,
      enum:    ['Scheduled', 'Serving', 'Done', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
ReservationSchema.index({ date: 1, status: 1 });
ReservationSchema.index({ date: 1, timeSlot: 1 });
ReservationSchema.index({ email: 1 });
ReservationSchema.index({ createdAt: -1 });

const Reservation: Model<IReservation> =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>('Reservation', ReservationSchema);

export default Reservation;
