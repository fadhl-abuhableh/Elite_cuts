
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatBot } from '../useChatBot';
import { supabase } from '@/lib/supabase';

// Mock the toast function
vi.mock('sonner', () => ({
  toast: vi.fn(),
}));

// Mock the useNavigate hook
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock Supabase client using a factory function
vi.mock('@/lib/supabase', () => {
  const mockData = {
    services: [
      {
        id: '1',
        name: 'Classic Haircut',
        price: 35,
        duration_minutes: 45,
        description: 'Our signature haircut includes consultation, shampoo, cut, and style.',
      },
      {
        id: '2',
        name: 'Beard Trim',
        price: 20,
        duration_minutes: 30,
        description: 'Professional beard grooming and shaping.',
      },
    ],
    barbers: [
      {
        id: '1',
        name: 'James Wilson',
        bio: 'Expert in classic cuts and modern styles. Specializes in traditional techniques.',
      },
      {
        id: '2',
        name: 'Michael Brown',
        bio: 'Specializes in beard grooming and contemporary styles.',
      },
    ],
    promotions: [
      {
        id: '1',
        title: 'New Client Special',
        details: '20% off your first visit',
        valid_until: '2024-12-31',
      },
      {
        id: '2',
        title: 'Tuesday Senior Discount',
        details: '15% off for seniors every Tuesday',
        valid_until: '2024-12-31',
      },
    ],
  };
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
    fetchServices: vi.fn().mockResolvedValue(mockData.services),
    fetchBarbers: vi.fn().mockResolvedValue(mockData.barbers),
    fetchFAQs: vi.fn().mockResolvedValue([]),
    fetchPromotions: vi.fn().mockResolvedValue(mockData.promotions),
    fetchLocations: vi.fn().mockResolvedValue([]),
    fetchWorkingHours: vi.fn().mockResolvedValue([]),
    checkBarberAvailability: vi.fn().mockResolvedValue(true),
    createAppointment: vi.fn().mockResolvedValue({ success: true }),
  };
});

// Extend the hook type to include processUserInput
type ChatBotHook = ReturnType<typeof useChatBot> & {
  processUserInput: (text: string) => Promise<string>;
};

describe('useChatBot', () => {
  let hook: ChatBotHook;

  beforeEach(async () => {
    const { result } = renderHook(() => useChatBot());
    // Cast the result to include processUserInput
    hook = result.current as ChatBotHook;
    
    // Wait for data initialization using a promise with timeout
    await act(async () => {
      return new Promise<void>((resolve, reject) => {
        const startTime = Date.now();
        const timeout = 5000; // 5 second timeout
        
        const checkInitialized = () => {
          if (result.current.dataInitialized) {
            resolve();
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout waiting for chatbot data initialization'));
          } else {
            setTimeout(checkInitialized, 50);
          }
        };
        checkInitialized();
      });
    });
  });

  describe('Dynamic Conversation Handling', () => {
    it('should handle service inquiry and maintain context', async () => {
      // Initial service inquiry
      await act(async () => {
        const response = await hook.processUserInput('What services do you offer?');
        expect(response).toContain('💇‍♂️ Our Services');
        expect(response).toContain('Classic Haircut - $35');
      });

      // Follow-up about specific service
      await act(async () => {
        const response = await hook.processUserInput('Tell me more about the classic haircut');
        expect(response).toContain('🎯 Service Details');
        expect(response).toContain('Classic Haircut');
        expect(response).toContain('$35');
      });

      // Booking request
      await act(async () => {
        const response = await hook.processUserInput('I want to book that');
        expect(response).toContain('Great! You\'ve selected Classic Haircut');
        expect(response).toContain('Which barber would you prefer');
      });
    });

    it('should handle topic shifts gracefully', async () => {
      // Start with booking
      await act(async () => {
        const response = await hook.processUserInput('Can I book a haircut?');
        expect(response).toContain('Which service would you like to book?');
      });

      // Shift to promotions
      await act(async () => {
        const response = await hook.processUserInput('Wait, actually what discounts do you have?');
        expect(response).toContain('🎉 Current Promotions');
        expect(response).toContain('New Client Special');
      });

      // Return to booking
      await act(async () => {
        const response = await hook.processUserInput('Ok go back to the haircut');
        expect(response).toContain('Which service would you like to book?');
      });
    });

    it('should handle barber recommendations and maintain context', async () => {
      // Start booking flow
      await act(async () => {
        const response = await hook.processUserInput('I want to book a classic haircut');
        expect(response).toContain('Great! You\'ve selected Classic Haircut');
      });

      // Ask for recommendation
      await act(async () => {
        const response = await hook.processUserInput('Which barber do you recommend?');
        expect(response).toContain('👨‍💼 Barber Recommendation');
        expect(response).toContain('James Wilson');
        expect(response).toContain('Expert in classic cuts');
      });

      // Confirm recommendation
      await act(async () => {
        const response = await hook.processUserInput('Yes, that sounds good');
        expect(response).toContain('What date would you like to book?');
      });
    });

    it('should handle clarification requests', async () => {
      // Ambiguous service request
      await act(async () => {
        const response = await hook.processUserInput('I want a trim');
        expect(response).toContain('Would you like');
        expect(response).toContain('Beard Trim');
        expect(response).toContain('Classic Haircut');
      });

      // Clarify service
      await act(async () => {
        const response = await hook.processUserInput('The beard trim');
        expect(response).toContain('Beard Trim');
        expect(response).toContain('$20');
      });
    });

    it('should handle booking flow interruptions and resumptions', async () => {
      // Start booking
      await act(async () => {
        const response = await hook.processUserInput('I want to book a haircut');
        expect(response).toContain('Which service would you like to book?');
      });

      // Interrupt with question
      await act(async () => {
        const response = await hook.processUserInput('What are your hours?');
        expect(response).toContain('⏰ Business Hours');
      });

      // Resume booking
      await act(async () => {
        const response = await hook.processUserInput('Ok, let\'s book that haircut');
        expect(response).toContain('Which service would you like to book?');
      });
    });

    it('should handle multiple service inquiries without repetition', async () => {
      // First service inquiry
      await act(async () => {
        const response = await hook.processUserInput('What services do you offer?');
        expect(response).toContain('💇‍♂️ Our Services');
      });

      // Second service inquiry
      await act(async () => {
        const response = await hook.processUserInput('Can you list the services again?');
        expect(response).toContain('💇‍♂️ Our Services');
        // Should not repeat the exact same message
        expect(response).not.toBe(hook.messages[hook.messages.length - 2].text);
      });
    });

    it('should handle booking cancellation and restart', async () => {
      // Start booking
      await act(async () => {
        const response = await hook.processUserInput('I want to book a haircut');
        expect(response).toContain('Which service would you like to book?');
      });

      // Cancel booking
      await act(async () => {
        const response = await hook.processUserInput('Actually, I want to cancel');
        expect(response).toContain('I\'ve cancelled the booking process');
      });

      // Start new booking
      await act(async () => {
        const response = await hook.processUserInput('Ok, let\'s try booking again');
        expect(response).toContain('Which service would you like to book?');
      });
    });
  });
});
