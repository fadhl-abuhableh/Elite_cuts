import { DbStyleCategory } from './supabase';

export function formatStyleCategoryResponse(styleCategory: DbStyleCategory): string {
  return `💇‍♂️ **${styleCategory.name}**\n\n` +
         `Description: ${styleCategory.description}\n` +
         `Difficulty: ${styleCategory.difficulty_level}\n` +
         `Maintenance: ${styleCategory.maintenance_level}`;
}

export function formatServiceDetails(serviceName: string, price: number, duration: number, description: string): string {
  return `💇‍♂️ **${serviceName}**\n\n` +
         `${description}`;
}

export function formatHairColoringResponse(): string {
  return `💇‍♂️ **Hair Coloring Services**\n\n` +
         `Our professional hair coloring services include:\n\n` +
         `• Full Color\n` +
         `  Complete color transformation with premium products\n\n` +
         `• Highlights\n` +
         `  Partial highlights for a natural, sun-kissed look\n\n` +
         `• Balayage\n` +
         `  Hand-painted highlights for a natural, blended look\n\n` +
         `• Color Correction\n` +
         `  Fixing previous color jobs or achieving desired shade\n\n` +
         `All coloring services include:\n` +
         `• Professional consultation\n` +
         `• Premium color products\n` +
         `• Post-color treatment\n` +
         `• Styling`;
}

export function formatKidsHaircutResponse(): string {
  return `💇‍♂️ **Kids Haircut Service**\n\n` +
         `Our specialized kids haircut service includes:\n\n` +
         `• Child-friendly environment\n` +
         `• Experienced barbers with kids\n` +
         `• Fun styling options\n` +
         `• Small toy or treat after service\n\n` +
         `Perfect for children under 12 years old.`;
}

export function formatBeardTrimResponse(): string {
  return `💇‍♂️ **Beard Trim Service**\n\n` +
         `Our professional beard trim service includes:\n\n` +
         `• Detailed consultation\n` +
         `• Precision trimming\n` +
         `• Shape and style\n` +
         `• Hot towel treatment\n` +
         `• Beard oil application`;
}

export function formatHotTowelShaveResponse(): string {
  return `💇‍♂️ **Hot Towel Shave Service**\n\n` +
         `Our traditional hot towel shave includes:\n\n` +
         `• Pre-shave consultation\n` +
         `• Hot towel treatment\n` +
         `• Premium shaving cream\n` +
         `• Straight razor shave\n` +
         `• Post-shave treatment\n` +
         `• Aftershave application`;
}

interface StyleInfo {
  name: string;
  description: string;
  maintenanceLevel: string;
  suitableFor: string;
  estimatedTime: string;
  price: string;
}

const styleDetails: Record<string, StyleInfo> = {
  'modern-fade': {
    name: 'Modern Fade',
    description: 'A contemporary take on the classic fade, featuring a smooth gradient from very short sides to a longer top. This versatile style can be customized with different fade heights and top lengths.',
    maintenanceLevel: 'Medium - Requires touch-ups every 2-3 weeks to maintain the crisp fade',
    suitableFor: 'All hair types, especially good for those wanting a clean, professional look',
    estimatedTime: '45 minutes',
    price: '$35'
  },
  'classic-cut': {
    name: 'Classic Cut',
    description: 'A timeless, professional style with tapered sides and back, maintaining enough length on top for side-parting or classic combing. Perfect for business and formal occasions.',
    maintenanceLevel: 'Low to Medium - Recommended trim every 4-6 weeks',
    suitableFor: 'Straight to wavy hair types, ideal for professional settings',
    estimatedTime: '30 minutes',
    price: '$30'
  },
  'textured-crop': {
    name: 'Textured Crop',
    description: 'A modern, low-maintenance style featuring a textured top with shorter sides. The choppy, textured finish creates a casual, effortlessly stylish look.',
    maintenanceLevel: 'Low - Can go 4-8 weeks between cuts',
    suitableFor: 'All hair types, especially good for thick or wavy hair',
    estimatedTime: '40 minutes',
    price: '$35'
  },
  'pompadour': {
    name: 'Pompadour',
    description: 'A classic style with volume and sweep, featuring longer hair on top styled upward and back, with shorter sides. Can be styled for both casual and formal occasions.',
    maintenanceLevel: 'High - Requires regular styling and maintenance every 3-4 weeks',
    suitableFor: 'Medium to thick hair types, good for those willing to style daily',
    estimatedTime: '45 minutes',
    price: '$40'
  }
};

export function getStyleResponse(styleName: string): string {
  const style = styleDetails[styleName.toLowerCase().replace(' ', '-')];
  
  if (!style) {
    return 'I apologize, but I don\'t have information about that specific style. Would you like to know about our Modern Fade, Classic Cut, Textured Crop, or Pompadour styles?';
  }

  return `
${style.name}:
${style.description}

• Suitable For: ${style.suitableFor}
• Maintenance: ${style.maintenanceLevel}`;
}

export function getAllStyleNames(): string[] {
  return Object.values(styleDetails).map(style => style.name);
} 