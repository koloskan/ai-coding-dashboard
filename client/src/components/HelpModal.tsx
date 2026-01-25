import { useState } from 'react';
import { X, AlertTriangle, TrendingUp, Filter, Target, ChevronDown, ChevronUp, BookOpen, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'guide' | 'faq';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('guide');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  if (!isOpen) return null;

  const sections = [
    {
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-100',
      title: 'The Alarm System',
      subtitle: 'Critical Alerts',
      whatItDoes: 'Automatically scans millions of data points to find business threats.',
      action: 'If you see a Red Alert, it means a specific region (like APAC) or metric (like Churn) has breached a safety threshold. Investigate immediately.',
    },
    {
      icon: TrendingUp,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-100',
      title: 'The Growth Tracker',
      subtitle: 'Charts',
      whatItDoes: 'The Line Chart compares Traffic (Blue) vs. Sales (Green).',
      action: 'Watch for the \'Gap\'. If Blue goes up but Green stays flat, your marketing quality is dropping.',
      isProTip: true,
    },
    {
      icon: Filter,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-100',
      title: 'The Conversion Funnel',
      subtitle: '',
      whatItDoes: 'Visualize where you lose customers.',
      action: 'If the drop-off from \'Signup\' to \'Trial\' is huge, your onboarding process is broken.',
    },
    {
      icon: Target,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-100',
      title: 'The \'Wasted Spend\' Detector',
      subtitle: 'Bottom Table',
      whatItDoes: 'Highlights keywords that have high traffic (>2,000) but low conversions (<1.5%).',
      action: 'These rows turn Red automatically. Stop spending money on these keywords or change the landing page content.',
    },
  ];

  const faqItems: FAQItem[] = [
    {
      question: 'Why is the APAC region always red?',
      answer: 'Our system automatically flags regions where the Trial-to-Paid rate drops below 12%. APAC is currently averaging 8.9%, which indicates a pricing or payment issue in that market.',
    },
    {
      question: 'What does \'Wasted Traffic\' mean?',
      answer: 'These are keywords (usually \'Educational\' like \'how to code\') that bring over 2,000 visitors but result in almost zero sales (<1.5% conversion). We shouldn\'t pay for ads on these.',
    },
    {
      question: 'How often does this data update?',
      answer: 'The dashboard ingests new CSV exports instantly. Currently showing data through Dec 2025.',
    },
    {
      question: 'What is the \'AI Overview\' risk label?',
      answer: 'We flag keywords that are losing traffic (-10% YoY) because AI summaries (like ChatGPT or Gemini) are answering the user\'s question directly, so they don\'t click our link.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Guide</h2>
            <p className="text-sm text-gray-500 mt-1">How to use your Marketing Dashboard</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-primary-500 text-primary-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Quick Guide
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'faq'
                ? 'border-primary-500 text-primary-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            FAQ
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'guide' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <div 
                      key={index}
                      className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      {/* Section Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-3 rounded-lg ${section.iconBg}`}>
                          <Icon className={`w-6 h-6 ${section.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{section.title}</h3>
                          {section.subtitle && (
                            <span className="text-sm text-gray-500">{section.subtitle}</span>
                          )}
                        </div>
                      </div>

                      {/* What it does */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">What it does:</p>
                        <p className="text-sm text-gray-600">{section.whatItDoes}</p>
                      </div>

                      {/* Action / Pro Tip */}
                      <div className={`p-3 rounded-lg ${section.isProTip ? 'bg-blue-50 border border-blue-100' : 'bg-amber-50 border border-amber-100'}`}>
                        <p className={`text-sm font-medium mb-1 ${section.isProTip ? 'text-blue-700' : 'text-amber-700'}`}>
                          {section.isProTip ? '💡 Pro Tip:' : '⚡ Action:'}
                        </p>
                        <p className={`text-sm ${section.isProTip ? 'text-blue-600' : 'text-amber-600'}`}>
                          {section.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer tip */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Quick Navigation:</span> Use the top navigation bar to switch between Dashboard, Analytics, Regional, and Campaigns views. Each page provides specialized insights for different aspects of your marketing performance.
                </p>
              </div>
            </>
          ) : (
            /* FAQ Tab Content */
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-6">
                Common questions from the team about using this dashboard.
              </p>
              
              {faqItems.map((item, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 pr-4">
                      Q: {item.question}
                    </span>
                    {openFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFAQ === index && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                      <p className="text-sm text-gray-700 pt-3">
                        <span className="font-medium text-primary-600">A:</span> {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Additional help */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Still have questions?</span> Contact the Data Team or check the Analytics page for detailed keyword-level insights.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
