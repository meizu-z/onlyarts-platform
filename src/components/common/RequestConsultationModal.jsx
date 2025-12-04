import React, { useState } from 'react';
import { Calendar, MessageSquare, Video, X } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { useToast } from '../ui/Toast';
import { consultationService } from '../../services/consultation.service';

const RequestConsultationModal = ({ isOpen, onClose, artist }) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    topic: '',
    notes: '',
  });

  const topicCategories = [
    'Portfolio Review',
    'Career Guidance',
    'NFT Strategy',
    'Technique & Skills',
    'Art Business',
    'Collaboration Opportunity',
    'Commission Discussion',
    'General Advice',
    'Other',
  ];

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
    '08:00 PM',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.date || !formData.time || !formData.topic) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date and time
      const dateTime = `${formData.date} ${formData.time}`;

      // Submit consultation request
      await consultationService.requestConsultation({
        artistId: artist.id,
        dateTime: dateTime,
        topic: formData.topic,
        notes: formData.notes,
      });

      toast.success('Consultation request sent! 🎉');

      // Reset form and close modal
      setFormData({ date: '', time: '', topic: '', notes: '' });
      onClose();
    } catch (error) {
      console.error('Error requesting consultation:', error);
      toast.error(error.message || 'Failed to send consultation request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ date: '', time: '', topic: '', notes: '' });
    onClose();
  };

  if (!artist) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <Video className="text-purple-400" size={24} />
          <div>
            <h3 className="text-xl font-bold text-[#f2e9dd]">Request Consultation</h3>
            <p className="text-sm text-[#f2e9dd]/70">with {artist.name || artist.username}</p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-[#f2e9dd] font-semibold mb-2">
            <Calendar className="inline" size={16} /> Preferred Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg text-[#f2e9dd] focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-[#f2e9dd] font-semibold mb-2">
            Preferred Time <span className="text-red-400">*</span>
          </label>
          <select
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg text-[#f2e9dd] focus:outline-none focus:border-purple-500"
            required
          >
            <option value="">Select a time slot</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Category */}
        <div>
          <label className="block text-[#f2e9dd] font-semibold mb-2">
            <MessageSquare className="inline" size={16} /> Topic Category <span className="text-red-400">*</span>
          </label>
          <select
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg text-[#f2e9dd] focus:outline-none focus:border-purple-500"
            required
          >
            <option value="">Select a topic</option>
            {topicCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-[#f2e9dd] font-semibold mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any specific topics or questions you'd like to discuss..."
            rows="4"
            className="w-full px-4 py-3 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg text-[#f2e9dd] focus:outline-none focus:border-purple-500 resize-none"
          />
          <p className="text-[#f2e9dd]/50 text-sm mt-2">
            Provide more details to help the artist prepare for your consultation
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
          <p className="text-sm text-[#f2e9dd]/70">
            <strong className="text-blue-400">Note:</strong> This is a consultation request. The artist will review your request and confirm availability. You'll receive a notification once they respond.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleClose}
            variant="secondary"
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isSubmitting ? (
              'Sending...'
            ) : (
              <>
                <Video size={16} className="mr-2" />
                Request Consultation
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RequestConsultationModal;
