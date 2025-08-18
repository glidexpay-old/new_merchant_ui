'use client';

import React, { useEffect, useState } from 'react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const mockFetchFAQs = async (): Promise<FAQ[]> => {
  // Simulate fetching from a database/API
  return [
    {
      id: 1,
      question: 'What is the Merchant Portal?',
      answer: 'The Merchant Portal is a dashboard for managing your merchant account, transactions, and reports.'
    },
    {
      id: 2,
      question: 'How do I reset my password?',
      answer: 'Go to Settings > Security and click on the Reset Password button.'
    },
    {
      id: 3,
      question: 'How can I contact support?',
      answer: 'You can contact support via the Help section or email us at support@merchantportal.com.'
    },
    {
      id: 4,
      question: 'Where can I view my transaction history?',
      answer: 'Navigate to Reports > Transactions to view your complete transaction history.'
    }
  ];
};

const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    mockFetchFAQs().then(setFaqs);
  }, []);

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto py-14 px-6">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 tracking-tight">Frequently Asked Questions</h1>
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none text-lg bg-white placeholder-gray-400"
        />
      </div>
      <div className="space-y-5">
        {filteredFaqs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No questions found.</div>
        ) : (
          filteredFaqs.map((faq, idx) => (
            <div key={faq.id} className="border border-gray-200 rounded-xl shadow-sm bg-white transition hover:shadow-md">
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 group"
                onClick={() => handleToggle(idx)}
                aria-expanded={openIndex === idx}
              >
                <span className="font-semibold text-lg text-gray-800 group-hover:text-primary-600 transition-colors">{faq.question}</span>
                <span className="text-2xl text-primary-500 font-bold transition-transform duration-200 transform group-hover:scale-125">{openIndex === idx ? '-' : '+'}</span>
              </button>
              {openIndex === idx && (
                <div className="px-6 py-4 border-t border-gray-100 text-gray-700 animate-fade-in text-base leading-relaxed bg-gray-50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FAQPage;