import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter,
    FiAlignRight, FiAlignJustify, FiList, FiLink, FiImage, FiGrid,
    FiRotateCcw, FiRotateCw, FiCode, FiMinus, FiCornerDownLeft,
    FiX, FiDroplet, FiSlash
} from 'react-icons/fi';
import { useToast } from '../ToastNotification';
import { postMultipart } from '../../api/api';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

const FONT_FAMILIES = [
    { name: 'Default', value: 'var(--font-family, sans-serif)' },
    { name: 'Google Sans', value: "'Google Sans', sans-serif" },
    { name: 'Inter', value: "'Inter', sans-serif" },
    { name: 'Arial', value: "Arial, Helvetica, sans-serif" },
    { name: 'Georgia', value: "Georgia, serif" },
    { name: 'Monospace', value: "monospace" },
];

const FONT_SIZES = [
    { name: 'Small', value: '1' },      // ~10-12px
    { name: 'Normal', value: '3' },     // ~16px
    { name: 'Medium', value: '4' },     // ~18-20px
    { name: 'Large', value: '5' },      // ~24px
    { name: 'Extra Large', value: '6' },// ~32px
];

const COLOR_SWATCHES = [
    '#12131A', '#2F6FED', '#F5A524', '#10B981', '#E5484D',
    '#7C3AED', '#EC4899', '#3B82F6', '#64748B', '#000000',
    '#FFFFFF', '#FEF08A', '#BBF7D0', '#BFDBFE', '#FBCFE8'
];

const RichTextEditor = ({
    value = '',
    onChange,
    placeholder = 'Write detailed product description...',
    disabled = false
}) => {
    const editorRef = useRef(null);
    const toast = useToast();
    const [showSource, setShowSource] = useState(false);
    const [sourceValue, setSourceValue] = useState(value || '');
    const [activeFormats, setActiveFormats] = useState({});
    const isInternalChange = useRef(false);
    const savedRangeRef = useRef(null);

    // Selection helpers to preserve cursor position when opening modals
    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedRangeRef.current = sel.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        if (editorRef.current) {
            editorRef.current.focus();
            const sel = window.getSelection();
            if (savedRangeRef.current) {
                try {
                    sel.removeAllRanges();
                    sel.addRange(savedRangeRef.current);
                } catch {
                    // Fallback to focusing editor
                }
            }
        }
    };

    // Modals state
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [linkTargetBlank, setLinkTargetBlank] = useState(true);

    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [tableModalOpen, setTableModalOpen] = useState(false);
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);

    const [textColorPickerOpen, setTextColorPickerOpen] = useState(false);
    const [bgColorPickerOpen, setBgColorPickerOpen] = useState(false);

    // Initialize content
    useEffect(() => {
        if (editorRef.current && !isInternalChange.current) {
            const currentHtml = editorRef.current.innerHTML;
            if (currentHtml !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
        setSourceValue(value || '');
        isInternalChange.current = false;
    }, [value]);

    const updateContent = useCallback(() => {
        if (!editorRef.current) return;
        const rawHtml = editorRef.current.innerHTML;
        const clean = sanitizeHtml(rawHtml);
        isInternalChange.current = true;
        setSourceValue(clean);
        if (onChange) onChange(clean);
    }, [onChange]);

    // Format Command Execution
    const exec = (command, value = null) => {
        if (disabled) return;
        document.execCommand(command, false, value);
        if (editorRef.current) editorRef.current.focus();
        updateContent();
        checkActiveFormats();
    };

    const checkActiveFormats = () => {
        if (!editorRef.current) return;
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough'),
            subscript: document.queryCommandState('subscript'),
            superscript: document.queryCommandState('superscript'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            insertOrderedList: document.queryCommandState('insertOrderedList'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            justifyFull: document.queryCommandState('justifyFull'),
        });
    };

    // Handle Copy/Paste from Word, Google Docs or websites cleanly
    const handlePaste = (e) => {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedHtml = clipboardData.getData('text/html');
        const pastedText = clipboardData.getData('text/plain');

        if (pastedHtml) {
            // Clean up MS Word and external tags
            let cleaned = pastedHtml
                .replace(/<!--[\s\S]*?-->/gi, '')
                .replace(/<\/?(meta|link|style|script|xml|o:[a-z]+|w:[a-z]+|m:[a-z]+|v:[a-z]+)[^>]*>/gi, '')
                .replace(/style="[^"]*mso-[^"]*"/gi, '')
                .replace(/class="[^"]*Mso[^"]*"/gi, '');
            cleaned = sanitizeHtml(cleaned);
            document.execCommand('insertHTML', false, cleaned);
        } else if (pastedText) {
            document.execCommand('insertText', false, pastedText);
        }
        updateContent();
    };

    // Format Block (Headings & Paragraph)
    const handleFormatBlock = (val) => {
        if (val === 'p' || val === 'h1' || val === 'h2' || val === 'h3' || val === 'h4' || val === 'h5' || val === 'h6' || val === 'pre' || val === 'blockquote') {
            exec('formatBlock', `<${val}>`);
        } else if (val === 'code') {
            document.execCommand('insertHTML', false, `<code>${window.getSelection()?.toString() || 'code'}</code>`);
            updateContent();
        }
    };

    // Link insertion
    const handleInsertLink = (e) => {
        e.preventDefault();
        if (!linkUrl || !linkUrl.trim()) {
            toast.error("Please enter a valid URL.");
            return;
        }

        let formattedUrl = linkUrl.trim();
        if (!/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(formattedUrl)) {
            formattedUrl = `https://${formattedUrl}`;
        }

        restoreSelection();

        const display = linkText.trim() || formattedUrl;
        const targetAttr = linkTargetBlank ? ' target="_blank" rel="noopener noreferrer"' : '';
        const linkHtml = `<a href="${formattedUrl}"${targetAttr} style="color: var(--primary, #2F6FED); text-decoration: underline;">${display}</a>`;

        document.execCommand('insertHTML', false, linkHtml);
        updateContent();
        setLinkModalOpen(false);
        setLinkUrl('');
        setLinkText('');
        toast.success("Hyperlink inserted.");
    };

    // Image insertion with file upload or URL
    const handleImageFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image file size must be less than 5MB.");
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            // Attempt file upload via multipart endpoint
            const res = await postMultipart('/site-content/upload', formData);
            if (res.data?.success && res.data?.url) {
                insertImageHtml(res.data.url);
            } else {
                // Fallback to DataURL
                const reader = new FileReader();
                reader.onload = () => {
                    insertImageHtml(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } catch {
            const reader = new FileReader();
            reader.onload = () => {
                insertImageHtml(reader.result);
            };
            reader.readAsDataURL(file);
        } finally {
            setUploadingImage(false);
        }
    };

    const insertImageHtml = (url) => {
        if (!url) return;
        restoreSelection();
        const imgHtml = `<div style="text-align: center; margin: 16px 0;"><img src="${url}" alt="Product description image" style="max-width: 100%; height: auto; border-radius: 12px; display: inline-block;" /></div>`;
        document.execCommand('insertHTML', false, imgHtml);
        updateContent();
        setImageModalOpen(false);
        setImageUrl('');
    };

    // Table insertion
    const handleInsertTable = (e) => {
        e.preventDefault();
        restoreSelection();
        let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid var(--border);">';
        tableHtml += '<thead><tr>';
        for (let j = 0; j < tableCols; j++) {
            tableHtml += `<th style="border: 1px solid var(--border); padding: 8px 12px; background: color-mix(in srgb, var(--primary) 8%, transparent); text-align: left; font-weight: 600;">Header ${j + 1}</th>`;
        }
        tableHtml += '</tr></thead><tbody>';

        for (let i = 0; i < tableRows; i++) {
            tableHtml += '<tr>';
            for (let j = 0; j < tableCols; j++) {
                tableHtml += `<td style="border: 1px solid var(--border); padding: 8px 12px;">Cell ${i + 1}-${j + 1}</td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';

        document.execCommand('insertHTML', false, tableHtml);
        updateContent();
        setTableModalOpen(false);
    };

    // Source view change handler
    const handleSourceChange = (e) => {
        const val = e.target.value;
        setSourceValue(val);
        if (editorRef.current) {
            editorRef.current.innerHTML = val;
        }
        if (onChange) onChange(val);
    };

    const ToolbarBtn = ({ icon: Icon, title, active, onClick, disabled: btnDisabled }) => (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled || btnDisabled}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition ${
                active
                    ? 'bg-[#2F6FED] text-white shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            } disabled:opacity-40 cursor-pointer`}
        >
            <Icon size={15} />
        </button>
    );

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden transition-colors">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50/80 p-2 sm:p-3 select-none">
                {/* History */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5 mr-1">
                    <ToolbarBtn icon={FiRotateCcw} title="Undo (Ctrl+Z)" onClick={() => exec('undo')} />
                    <ToolbarBtn icon={FiRotateCw} title="Redo (Ctrl+Y)" onClick={() => exec('redo')} />
                </div>

                {/* Headings */}
                <div className="flex items-center gap-1 border-r border-gray-200 pr-1.5 mr-1">
                    <select
                        title="Text Format"
                        onChange={(e) => handleFormatBlock(e.target.value)}
                        className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 outline-none hover:border-gray-300 transition"
                    >
                        <option value="p">Paragraph</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="h4">Heading 4</option>
                        <option value="h5">Heading 5</option>
                        <option value="h6">Heading 6</option>
                        <option value="blockquote">Blockquote</option>
                        <option value="pre">Code Block</option>
                    </select>

                    <select
                        title="Font Family"
                        onChange={(e) => exec('fontName', e.target.value)}
                        className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 outline-none hover:border-gray-300 transition hidden sm:block"
                    >
                        {FONT_FAMILIES.map(f => (
                            <option key={f.name} value={f.value}>{f.name}</option>
                        ))}
                    </select>

                    <select
                        title="Font Size"
                        onChange={(e) => exec('fontSize', e.target.value)}
                        className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 outline-none hover:border-gray-300 transition"
                    >
                        {FONT_SIZES.map(s => (
                            <option key={s.name} value={s.value}>{s.name}</option>
                        ))}
                    </select>
                </div>

                {/* Basic Formatting */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5 mr-1">
                    <ToolbarBtn icon={FiBold} title="Bold (Ctrl+B)" active={activeFormats.bold} onClick={() => exec('bold')} />
                    <ToolbarBtn icon={FiItalic} title="Italic (Ctrl+I)" active={activeFormats.italic} onClick={() => exec('italic')} />
                    <ToolbarBtn icon={FiUnderline} title="Underline (Ctrl+U)" active={activeFormats.underline} onClick={() => exec('underline')} />
                    <ToolbarBtn icon={FiSlash} title="Strikethrough" active={activeFormats.strikeThrough} onClick={() => exec('strikeThrough')} />
                    <button
                        type="button"
                        title="Subscript"
                        onClick={() => exec('subscript')}
                        className={`px-2 h-8 rounded-lg text-xs font-bold transition ${activeFormats.subscript ? 'bg-[#2F6FED] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        x₂
                    </button>
                    <button
                        type="button"
                        title="Superscript"
                        onClick={() => exec('superscript')}
                        className={`px-2 h-8 rounded-lg text-xs font-bold transition ${activeFormats.superscript ? 'bg-[#2F6FED] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        x²
                    </button>
                </div>

                {/* Text Colors */}
                <div className="relative flex items-center gap-1 border-r border-gray-200 pr-1.5 mr-1">
                    <button
                        type="button"
                        title="Text Color"
                        onClick={() => setTextColorPickerOpen(!textColorPickerOpen)}
                        className="flex h-8 items-center gap-1 px-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                    >
                        <FiDroplet size={14} className="text-[#2F6FED]" />
                        <span className="border-b-2 border-[#2F6FED]">A</span>
                    </button>

                    {textColorPickerOpen && (
                        <div className="absolute left-0 top-full z-30 mt-1 rounded-xl bg-white p-2.5 shadow-xl border border-gray-200 flex flex-wrap gap-1.5 w-44">
                            {COLOR_SWATCHES.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => { exec('foreColor', c); setTextColorPickerOpen(false); }}
                                    className="h-6 w-6 rounded-md border border-gray-200 transition hover:scale-110"
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        title="Highlight Color"
                        onClick={() => setBgColorPickerOpen(!bgColorPickerOpen)}
                        className="flex h-8 items-center gap-1 px-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                    >
                        <span className="bg-[#FEF08A] px-1 rounded text-gray-900 font-bold">H</span>
                    </button>

                    {bgColorPickerOpen && (
                        <div className="absolute left-6 top-full z-30 mt-1 rounded-xl bg-white p-2.5 shadow-xl border border-gray-200 flex flex-wrap gap-1.5 w-44">
                            {COLOR_SWATCHES.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => { exec('hiliteColor', c); setBgColorPickerOpen(false); }}
                                    className="h-6 w-6 rounded-md border border-gray-200 transition hover:scale-110"
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5 mr-1 hidden md:flex">
                    <ToolbarBtn icon={FiAlignLeft} title="Align Left" active={activeFormats.justifyLeft} onClick={() => exec('justifyLeft')} />
                    <ToolbarBtn icon={FiAlignCenter} title="Align Center" active={activeFormats.justifyCenter} onClick={() => exec('justifyCenter')} />
                    <ToolbarBtn icon={FiAlignRight} title="Align Right" active={activeFormats.justifyRight} onClick={() => exec('justifyRight')} />
                    <ToolbarBtn icon={FiAlignJustify} title="Justify" active={activeFormats.justifyFull} onClick={() => exec('justifyFull')} />
                </div>

                {/* Lists & Indent */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5 mr-1">
                    <ToolbarBtn icon={FiList} title="Bullet List" active={activeFormats.insertUnorderedList} onClick={() => exec('insertUnorderedList')} />
                    <button
                        type="button"
                        title="Numbered List"
                        onClick={() => exec('insertOrderedList')}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${activeFormats.insertOrderedList ? 'bg-[#2F6FED] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        1.
                    </button>
                    <ToolbarBtn icon={FiCornerDownLeft} title="Increase Indent" onClick={() => exec('indent')} />
                </div>

                {/* Insert Elements */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5 mr-1">
                    <ToolbarBtn icon={FiLink} title="Insert Link" onClick={() => { saveSelection(); const selText = window.getSelection()?.toString(); setLinkText(selText || ''); setLinkModalOpen(true); }} />
                    <ToolbarBtn icon={FiImage} title="Insert Image" onClick={() => { saveSelection(); setImageModalOpen(true); }} />
                    <ToolbarBtn icon={FiGrid} title="Insert Table" onClick={() => { saveSelection(); setTableModalOpen(true); }} />
                    <ToolbarBtn icon={FiMinus} title="Horizontal Line" onClick={() => exec('insertHorizontalRule')} />
                </div>

                {/* Source Code View */}
                <div className="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setShowSource(!showSource)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                            showSource ? 'bg-[#2F6FED] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <FiCode size={14} />
                        <span>{showSource ? 'Visual Editor' : 'HTML Source'}</span>
                    </button>
                </div>
            </div>

            {/* Editor Surface */}
            <div className="relative">
                {!showSource ? (
                    <div
                        ref={editorRef}
                        contentEditable={!disabled}
                        onInput={updateContent}
                        onKeyUp={checkActiveFormats}
                        onMouseUp={checkActiveFormats}
                        onPaste={handlePaste}
                        placeholder={placeholder}
                        className="prose-theme min-h-[220px] overflow-auto px-5 py-4 text-sm text-gray-800 outline-none leading-relaxed"
                        style={{
                            minHeight: '220px',
                            resize: 'vertical',
                        }}
                    />
                ) : (
                    <textarea
                        value={sourceValue}
                        onChange={handleSourceChange}
                        rows={10}
                        placeholder="HTML source code..."
                        className="w-full min-h-[220px] font-mono text-xs bg-gray-900 text-green-400 p-4 outline-none resize-y"
                        style={{
                            resize: 'vertical',
                        }}
                    />
                )}
            </div>

            {/* Insert Link Modal */}
            {linkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <FiLink className="text-[#2F6FED]" /> Insert Hyperlink
                            </h3>
                            <button type="button" onClick={() => setLinkModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">URL Link *</label>
                                <input
                                    type="url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#2F6FED]"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Link Text (Optional)</label>
                                <input
                                    type="text"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    placeholder="e.g. View Warranty Terms"
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#2F6FED]"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="targetBlank"
                                    checked={linkTargetBlank}
                                    onChange={(e) => setLinkTargetBlank(e.target.checked)}
                                    className="rounded border-gray-300 text-[#2F6FED]"
                                />
                                <label htmlFor="targetBlank" className="text-gray-700">Open link in new browser tab</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button type="button" onClick={() => setLinkModalOpen(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600">Cancel</button>
                            <button type="button" onClick={handleInsertLink} className="rounded-xl bg-[#2F6FED] px-4 py-2 text-xs font-semibold text-white">Insert Link</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Insert Image Modal */}
            {imageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <FiImage className="text-[#2F6FED]" /> Insert Product Image
                            </h3>
                            <button type="button" onClick={() => setImageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1.5">Upload Image File</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageFileUpload}
                                    className="w-full text-xs text-gray-500 file:mr-3 file:rounded-xl file:border-0 file:bg-[#2F6FED]/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#2F6FED] hover:file:bg-[#2F6FED]/20"
                                />
                            </div>
                            <div className="relative text-center">
                                <span className="bg-white px-2 text-gray-400 text-[11px] font-semibold uppercase">Or Image URL</span>
                            </div>
                            <div>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/product-feature.jpg"
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#2F6FED]"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button type="button" onClick={() => setImageModalOpen(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600">Cancel</button>
                            <button
                                type="button"
                                disabled={!imageUrl || uploadingImage}
                                onClick={() => insertImageHtml(imageUrl)}
                                className="rounded-xl bg-[#2F6FED] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                            >
                                {uploadingImage ? 'Uploading...' : 'Insert Image'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Insert Table Modal */}
            {tableModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <FiGrid className="text-[#2F6FED]" /> Create Table
                            </h3>
                            <button type="button" onClick={() => setTableModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Rows</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={tableRows}
                                    onChange={(e) => setTableRows(Math.max(1, Number(e.target.value)))}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#2F6FED]"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Columns</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={tableCols}
                                    onChange={(e) => setTableCols(Math.max(1, Number(e.target.value)))}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#2F6FED]"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button type="button" onClick={() => setTableModalOpen(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600">Cancel</button>
                            <button type="button" onClick={handleInsertTable} className="rounded-xl bg-[#2F6FED] px-4 py-2 text-xs font-semibold text-white">Create Table</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;
