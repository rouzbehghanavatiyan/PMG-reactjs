import React, { useState } from 'react';
import { FileText, Upload, Trash2, Eye, Download, Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { DocumentFile } from '../../utils/masterTypes';

const initialDocs: DocumentFile[] = [
  { id: '1', name: 'Employee_Handbook_2024.pdf', type: 'application/pdf', size: '2.4 MB', date: '2023-01-15', category: 'Policy' },
  { id: '2', name: 'Leave_Request_Form.pdf', type: 'application/pdf', size: '0.5 MB', date: '2023-05-20', category: 'Form' },
  { id: '3', name: 'IT_Security_Guidelines.pdf', type: 'application/pdf', size: '1.2 MB', date: '2023-08-10', category: 'Policy' },
  { id: '4', name: 'Sales_Performance_Q3.pdf', type: 'application/pdf', size: '3.1 MB', date: '2023-10-01', category: 'Other' },
];

const Documents: React.FC = () => {
  const [docs, setDocs] = useState<DocumentFile[]>(initialDocs);
  const [filter, setFilter] = useState('All');
  const { t, dir } = useLanguage();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const newDoc: DocumentFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        date: new Date().toISOString().split('T')[0],
        category: 'Other',
        url: URL.createObjectURL(file) // Create a temporary URL for preview
      };
      setDocs([newDoc, ...docs]);
    } else if (file) {
      alert("Only PDF files are allowed.");
    }
  };

  const handleDelete = (id: string) => {
    setDocs(docs.filter(d => d.id !== id));
  };

  const filteredDocs = filter === 'All' ? docs : docs.filter(d => d.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bmw-text">{t('docs_title')}</h1>
          <p className="text-bmw-textSec text-sm">{t('docs_sub')}</p>
        </div>
        
        {/* Upload Button Wrapper */}
        <label className="flex items-center gap-2 bg-bmw-blue text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/40">
          <Upload size={18} />
          <span className="font-medium">{t('upload_pdf')}</span>
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
        </label>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-bmw-surface border border-bmw-border p-4 rounded-lg items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-500`} size={18} />
          <input 
            type="text" 
            placeholder={t('search_docs')} 
            className={`w-full bg-bmw-base border border-bmw-border rounded-md ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-bmw-text text-sm focus:outline-none focus:border-bmw-blue`}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['all', 'policy', 'contract', 'form'].map((catKey) => (
            <button
              key={catKey}
              onClick={() => setFilter(catKey === 'all' ? 'All' : catKey.charAt(0).toUpperCase() + catKey.slice(1))}
              className={`px-4 py-2 rounded-md text-sm whitespace-nowrap transition-colors ${
                (filter.toLowerCase() === catKey || (catKey === 'all' && filter === 'All'))
                ? 'bg-bmw-text text-bmw-surface font-semibold' 
                : 'text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover'
              }`}
            >
              {t(`filters.${catKey}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-bmw-surface border border-bmw-border rounded-lg overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-bmw-border text-xs font-semibold text-bmw-textSec uppercase tracking-wider">
          <div className="col-span-6 md:col-span-5">{t('table.name')}</div>
          <div className="col-span-3 md:col-span-2 hidden md:block">{t('table.category')}</div>
          <div className="col-span-3 md:col-span-2 hidden md:block">{t('table.date')}</div>
          <div className="col-span-3 md:col-span-1 hidden md:block">{t('table.size')}</div>
          <div className="col-span-6 md:col-span-2 text-end">{t('table.actions')}</div>
        </div>

        <div className="divide-y divide-bmw-border">
          {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
            <div key={doc.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-bmw-hover transition-colors group">
              <div className="col-span-6 md:col-span-5 flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-red-900/10 text-red-500 rounded border border-red-900/20">
                  <FileText size={20} />
                </div>
                <span className="text-sm font-medium text-bmw-text truncate">{doc.name}</span>
              </div>
              <div className="col-span-2 hidden md:block">
                <span className="text-xs bg-bmw-base text-bmw-textSec px-2 py-1 rounded border border-bmw-border">
                  {t(`filters.${doc.category.toLowerCase()}`) || doc.category}
                </span>
              </div>
              <div className="col-span-2 hidden md:block text-sm text-bmw-textSec">{doc.date}</div>
              <div className="col-span-1 hidden md:block text-sm text-gray-500 font-mono">{doc.size}</div>
              <div className="col-span-6 md:col-span-2 flex items-center justify-end gap-2">
                {doc.url && (
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-bmw-textSec hover:text-bmw-text hover:bg-bmw-base rounded-full transition-colors"
                    title="Preview"
                  >
                    <Eye size={16} />
                  </a>
                )}
                <button className="p-2 text-bmw-textSec hover:text-bmw-blue hover:bg-bmw-base rounded-full transition-colors">
                  <Download size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-bmw-textSec hover:text-red-500 hover:bg-red-900/20 rounded-full transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-bmw-textSec">
              <FileText className="mx-auto mb-4 opacity-20" size={48} />
              <p>No documents found matching this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;