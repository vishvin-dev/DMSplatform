import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, Row,
    Modal, ModalBody, ModalHeader, Input, Alert, Badge, ListGroup, ListGroupItem, Spinner, InputGroup, Progress,
    ModalFooter
} from 'reactstrap';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';
import { getDocumentDropdowns, postDocumentUpload } from '../../helpers/fakebackend_helper';
import { io } from "socket.io-client";
import axios from 'axios';

// --- CONSTANTS ---
const VIEW_DOCUMENT_URL = "http://192.168.23.229:9000/backend-service/documentUpload/documentView";
const SCANNER_ENDPOINT = "http://192.168.23.229:5000";

// --- HELPERS ---
const getHighlightBadgeStyle = (itemType) => {
    const styles = {
        Header: { backgroundColor: 'rgba(64, 81, 137, 0.15)', color: '#405189' },
        Footer: { backgroundColor: 'rgba(41, 156, 102, 0.15)', color: '#299c66' },
        Word: { backgroundColor: 'rgba(241, 180, 76, 0.15)', color: '#f1b44c' }
    };
    return styles[itemType] || {};
};

const getFileIcon = (fileName) => {
    if (!fileName) return <i className="ri-file-line fs-3 text-secondary"></i>;
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'pdf') return <i className="ri-file-pdf-line fs-3 text-danger"></i>;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return <i className="ri-image-line fs-3 text-success"></i>;
    return <i className="ri-file-line fs-3 text-secondary"></i>;
};

const getImageDimensions = (blob) => new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
    };
    img.onerror = (err) => {
        reject(err);
        URL.revokeObjectURL(url);
    };
    img.src = url;
});

// --- SUB-COMPONENTS ---
const TagEditor = ({ tags, onAddTag, onRemoveTag, readOnly = false }) => {
    const [newTag, setNewTag] = useState('');
    const handleAdd = () => {
        if (readOnly) return;
        const trimmedTag = newTag.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            onAddTag(trimmedTag);
            setNewTag('');
        }
    };
    return (
        <>
            <div className="d-flex flex-wrap gap-1 mb-2 tag-container">
                {tags.map((tag, index) => (
                    <Badge key={index} color="light" pill className="tag-badge">
                        {tag}
                        {!readOnly && <button type="button" className="btn-close btn-close-xs ms-1" onClick={() => onRemoveTag(tag)}></button>}
                    </Badge>
                ))}
            </div>
            {!readOnly && (
                <InputGroup>
                    <Input bsSize="sm" type="text" placeholder="Add a tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') handleAdd(); }} disabled={readOnly} />
                    <Button size="sm" color="secondary" outline onClick={handleAdd} disabled={readOnly}>Add</Button>
                </InputGroup>
            )}
        </>
    );
};

const DocumentThumbnails = ({ documents, selectedFile, onFileSelect }) => (
    <Card className="h-100 d-flex flex-column">
        <CardHeader className="bg-light p-3 position-relative" style={{ borderTop: '3px solid #405189' }}>
            <h5 className="mb-0">Documents<Badge color="secondary" pill>{documents.length}</Badge></h5>
        </CardHeader>
        <CardBody className="p-2 thumbnail-pane flex-grow-1" style={{ overflowY: 'auto', minHeight: 0 }}>
            <Row className="g-2">
                {documents.map(doc => (
                    <Col key={doc.id} xs={6} md={4} lg={6}>
                        <div
                            className={`thumbnail-card p-2 border rounded text-center ${selectedFile?.id === doc.id ? 'active' : ''}`}
                            onClick={() => onFileSelect(doc)}
                        >
                            {getFileIcon(doc.name || doc.DraftName)}
                            <p className="thumbnail-name text-muted small mt-2 mb-0 text-truncate">{doc.name || doc.DraftName}</p>
                        </div>
                    </Col>
                ))}
            </Row>
        </CardBody>
    </Card>
);

const DocumentPreview = ({ file, loading, error }) => {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
    const previewRef = useRef(null);

    useEffect(() => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setRotation(0);
    }, [file]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.2));
    const handleReset = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setRotation(0);
    };

    useEffect(() => {
        const element = previewRef.current;
        if (!element) return;
        const onWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY;
            setZoom(prevZoom => {
                if (delta < 0) return Math.min(prevZoom * 1.2, 5);
                else return Math.max(prevZoom / 1.2, 0.2);
            });
        };
        element.addEventListener('wheel', onWheel, { passive: false });
        return () => {
            if (element) element.removeEventListener('wheel', onWheel);
        };
    }, []);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setStartDrag({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({ x: e.clientX - startDrag.x, y: e.clientY - startDrag.y });
    };

    const handleMouseUpOrLeave = () => setIsDragging(false);

    const checkIsImage = (file) => {
        if (!file || !file.previewUrl) return false;
        if (file.type && (file.type.startsWith('image/') || file.type === 'image/jpeg' || file.type === 'image/png')) return true;
        const name = file.name || file.DraftName || '';
        if (name.match(/\.(jpeg|jpg|png|gif)$/i)) return true;
        return false;
    };

    const checkIsPdf = (file) => {
        if (!file || !file.previewUrl) return false;
        if (file.type === 'application/pdf') return true;
        const name = file.name || file.DraftName || '';
        if (name.match(/\.pdf$/i)) return true;
        if (file.previewUrl.includes('.pdf')) return true;
        return false;
    };

    const isImage = checkIsImage(file);
    const isPdf = checkIsPdf(file);
    const cursorStyle = isDragging ? 'grabbing' : (zoom > 1 ? 'grab' : 'default');

    return (
        <Card className="flex-grow-1 d-flex flex-column">
            <CardHeader className="bg-light p-3 position-relative" style={{ borderTop: '3px solid #405189' }}>
                <h5 className="mb-0">Preview</h5>
            </CardHeader>
            <CardBody
                ref={previewRef}
                className="flex-grow-1 position-relative d-flex align-items-center justify-content-center"
                style={{ overflow: 'hidden', minHeight: '0', cursor: cursorStyle }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
            >
                {loading ? <Spinner>Loading...</Spinner> :
                    error ? <Alert color="danger" className="m-3">{error}</Alert> :
                        file && file.previewUrl ? (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                transition: 'transform 0.1s ease-out'
                            }}>
                                {isImage ? (
                                    <img
                                        src={file.previewUrl}
                                        alt={file.name}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/400?text=Image+Load+Error";
                                        }}
                                        draggable="false"
                                    />
                                ) : isPdf ? (
                                    <embed
                                        src={`${file.previewUrl}#toolbar=0`}
                                        type="application/pdf"
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                ) : (
                                    <div className="text-center text-muted">
                                        <h4>Preview Not Supported</h4>
                                        <p>File Type: {file.type || 'Unknown'}</p>
                                        <p>Name: {file.name || file.DraftName}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-muted">
                                <i className="ri-mouse-line display-4"></i>
                                <h5 className="mt-3">Select a Document</h5>
                                <p>Choose a document from the left to preview it here.</p>
                            </div>
                        )}
                {file && (
                    <div className="zoom-controls">
                        <Button size="sm" color="light" onClick={handleZoomOut} title="Zoom Out"><i className="ri-zoom-out-line"></i></Button>
                        <Button size="sm" color="light" onClick={handleZoomIn} title="Zoom In"><i className="ri-zoom-in-line"></i></Button>
                        <Button size="sm" color="light" onClick={handleReset} title="Reset View"><i className="ri-fullscreen-exit-line"></i></Button>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

const DocumentInfoPanel = ({ selectedFile, highlights, tags, onTagsChange, comment, onCommentChange, isVerified, onVerifiedChange, onSubmit, loading, canSubmit, readOnly = false, verificationDetails }) => (
    <div className="info-pane">
        <Card className="mb-3">
            <CardHeader className="bg-light p-3" style={{ borderTop: '3px solid #405189' }}><h6 className="mb-0">Scanned Highlights</h6></CardHeader>
            <CardBody className="p-2">
                {selectedFile ? (
                    <ListGroup flush className="small">
                        {highlights.map((item, index) => (
                            <ListGroupItem key={index} className="px-1 py-1 border-0 d-flex align-items-center">
                                <Badge className="me-2" style={getHighlightBadgeStyle(item.type)}>{item.type}</Badge>
                                <span className="text-truncate">{item.text}</span>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                ) : <p className="text-muted small m-1">Select a document.</p>}
            </CardBody>
        </Card>
        <Card className="mb-3">
            <CardHeader className="bg-light p-3" style={{ borderTop: '3px solid #405189' }}><h6 className="mb-0">Document Details</h6></CardHeader>
            <CardBody className="p-2">
                <ListGroup flush className="small">
                    {verificationDetails ? (
                        <>
                            <ListGroupItem className="px-1 py-1 border-0 d-flex justify-content-between">
                                <strong>No. of Pages:</strong><span className="text-muted ms-1">{verificationDetails.noOfPages || 'N/A'}</span>
                            </ListGroupItem>
                            <ListGroupItem className="px-1 py-1 border-0 d-flex justify-content-between">
                                <strong>File Number:</strong><span className="text-muted ms-1">{verificationDetails.fileNumber || 'N/A'}</span>
                            </ListGroupItem>
                            <hr className="my-1" />
                        </>
                    ) : (
                        <ListGroupItem className="px-1 py-1 border-0 text-muted">Verification details are unavailable.</ListGroupItem>
                    )}

                    {selectedFile && (
                        <>
                            <ListGroupItem className="px-1 py-1 border-0 d-flex justify-content-between">
                                <strong>Doc Type:</strong><span className="text-muted ms-1">{selectedFile.category || 'N/A'}</span>
                            </ListGroupItem>
                            <ListGroupItem className="px-1 py-1 border-0 d-flex justify-content-between">
                                <strong>File Name:</strong><span className="text-muted ms-1 text-break">{selectedFile.name || selectedFile.DraftName}</span>
                            </ListGroupItem>
                            <ListGroupItem className="px-1 py-1 border-0 d-flex justify-content-between">
                                <strong>Desc:</strong><span className="text-muted ms-1">{selectedFile.description || selectedFile.DraftDescription || 'N/A'}</span>
                            </ListGroupItem>
                        </>
                    )}
                </ListGroup>
            </CardBody>
        </Card>
        <Card className="mb-3">
            <CardHeader className="bg-light p-3" style={{ borderTop: '3px solid #405189' }}><h6 className="mb-0">Meta Tags</h6></CardHeader>
            <CardBody className="p-2">
                {selectedFile ? (<TagEditor tags={tags} onAddTag={(tag) => onTagsChange([...tags, tag])} onRemoveTag={(tag) => onTagsChange(tags.filter(t => t !== tag))} readOnly={readOnly} />)
                    : <p className="text-muted small m-1">Select a document.</p>}
            </CardBody>
        </Card>
        <Card className="mb-3 flex-grow-1">
            <CardHeader className="bg-light p-3" style={{ borderTop: '3px solid #405189' }}><h6 className="mb-0">Response / Comments</h6></CardHeader>
            <CardBody className="p-2 d-flex">
                <Input type="textarea" className="w-100 h-100" placeholder={selectedFile ? "Enter comments..." : "Select a document..."} value={comment} onChange={onCommentChange} readOnly={!selectedFile || readOnly} />
            </CardBody>
        </Card>
        <div className="form-check mb-3">
            <Input className="form-check-input" type="checkbox" id="verificationCheck" checked={isVerified} onChange={(e) => onVerifiedChange(e.target.checked)} disabled={!canSubmit} />
            <label className="form-check-label" htmlFor="verificationCheck">All documents verified and uploaded successfully.</label>
        </div>
        <div className="d-grid">
            <Button color="primary" size="md" disabled={!canSubmit || loading || !isVerified} onClick={onSubmit}>
                {loading ? <><Spinner size="sm" className="me-2" />Submitting...</> : 'Submit Review'}
            </Button>
        </div>
    </div>
);

const ScanPreviewModal = ({
    isOpen, onClose, onRescan, onAddPage, onSubmit, scannedData, onDataChange,
    activeIndex, setActiveIndex,
    isAddingPageLoading, isRescanning, isSubmittingDraft,
    setScannedDocumentData,
    documentTypes,
    DocumentTypeDropdown
}) => {
    const iframeRef = useRef(null);
    const [isIframeReady, setIsIframeReady] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');
    const [ocrError, setOcrError] = useState('');
    const [ocrStatus, setOcrStatus] = useState('idle');

    const activePage = scannedData?.doc?.pages?.[activeIndex];

    const updateActivePage = useCallback((newProps) => {
        if (!activePage) return;
        setScannedDocumentData(prev => {
            if (!prev) return null;
            const updatedPages = prev.doc.pages.map(p =>
                p.id === activePage.id ? { ...p, ...newProps } : p
            );
            return { ...prev, doc: { ...prev.doc, pages: updatedPages } };
        });
    }, [activePage, setScannedDocumentData]);

    const handleZoomIn = () => updateActivePage({ zoom: Math.min((activePage.zoom || 1) * 1.2, 5), isFitted: false });
    const handleZoomOut = () => updateActivePage({ zoom: Math.max((activePage.zoom || 1) / 1.2, 0.2), isFitted: false });

    const handleRotate = (direction) => {
        if (!activePage) return;
        const newRotation = (activePage.rotation || 0) + 90 * direction;
        const shouldStayFitted = activePage.isFitted !== false;
        const newZoom = shouldStayFitted ? 1 : activePage.zoom;
        updateActivePage({ rotation: newRotation, zoom: newZoom });
    };

    const handleRotateRight = () => handleRotate(1);
    const handleRotateLeft = () => handleRotate(-1);

    const handleResetView = () => {
        if (!activePage) return;
        updateActivePage({ zoom: 1, isFitted: true });
    };

    const handleRunOcr = () => {
        if (iframeRef.current && activePage?.blob && ocrStatus !== 'running') {
            setOcrStatus('running');
            setRecognizedText('');
            setOcrError('');
            // Use try/catch when posting messages, though usually safe
            try {
                iframeRef.current.contentWindow.postMessage({ type: 'RUN_OCR' }, '*');
            } catch (e) {
                console.error("Failed to trigger OCR");
            }
        }
    };

    useEffect(() => {
        if (isOpen && isIframeReady && activePage && !activePage.isFitCalculated) {
            updateActivePage({ zoom: 1, isFitCalculated: true, isFitted: true });
        }
    }, [isOpen, isIframeReady, activePage, updateActivePage]);

    useEffect(() => {
        setIsIframeReady(false);
        setRecognizedText('');
        setOcrError('');
        setOcrStatus('idle');
    }, [activePage?.id]);

    useEffect(() => {
        if (isOpen && isIframeReady && activePage?.blob && iframeRef.current) {
            iframeRef.current.contentWindow.postMessage(
                { type: 'LOAD_IMAGE', blob: activePage.blob },
                '*'
            );
        }
    }, [isOpen, isIframeReady, activePage?.id, activePage?.blob]);

    useEffect(() => {
        if (isIframeReady && iframeRef.current && activePage) {
            iframeRef.current.contentWindow.postMessage(
                {
                    type: 'APPLY_TRANSFORM',
                    transform: { zoom: activePage.zoom || 1, rotation: activePage.rotation || 0 }
                },
                '*'
            );
        }
    }, [isIframeReady, activePage?.zoom, activePage?.rotation]);

    useEffect(() => {
        const handleMessageFromIframe = (event) => {
            // FIX: Added safety check to ignore invalid messages (e.g. from extensions)
            if (!event.data || typeof event.data !== 'object') return;
            
            const { type, text, error } = event.data;
            
            // Only process messages with a valid type we expect
            if (!type) return;

            switch (type) {
                case 'IFRAME_READY':
                    setIsIframeReady(true);
                    break;
                case 'OCR_RESULT':
                    setOcrStatus('completed');
                    setRecognizedText(text || 'No text recognized.');
                    setOcrError('');
                    break;
                case 'OCR_ERROR':
                    setOcrStatus('error');
                    setOcrError(error || 'An unknown OCR error occurred.');
                    setRecognizedText('');
                    break;
                case 'TEXT_SELECTED':
                    if (text && scannedData) {
                        const newTag = text.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '');
                        if (newTag && !scannedData.tags.includes(newTag)) {
                            onDataChange('tags', [...scannedData.tags, newTag]);
                        }
                    }
                    break;
                default:
                    // Ignore unknown message types (they might be from extensions)
                    break;
            }
        };
        window.addEventListener('message', handleMessageFromIframe);
        return () => window.removeEventListener('message', handleMessageFromIframe);
    }, [scannedData, onDataChange]);

    const isCategorySelected = scannedData?.doc?.category && scannedData.doc.category !== 'all';
    const isOtherValid = !scannedData?.isOther || (scannedData?.isOther && scannedData?.docName?.trim().length > 0);
    const canSubmit = isCategorySelected && isOtherValid;

    if (!scannedData) return null;

    const pages = scannedData.doc.pages;
    const next = () => setActiveIndex(prev => (prev + 1) % pages.length);
    const previous = () => setActiveIndex(prev => (prev - 1 + pages.length) % pages.length);
    const isActionInProgress = isAddingPageLoading || isRescanning || isSubmittingDraft;

    return (
        <Modal isOpen={isOpen} toggle={onClose} size="xl" centered backdrop="static">
            <ModalHeader toggle={onClose}>Review Scanned Document</ModalHeader>
            <ModalBody className="position-relative">
                {isAddingPageLoading && (
                    <div className="scanning-overlay">
                        <Spinner className="mb-3" style={{ width: '3rem', height: '3rem' }} />
                        <h4>Scanning Next Page...</h4>
                        <p className="text-muted">Waiting for document from scanner.</p>
                    </div>
                )}
                <Row>
                    <Col md={7}>
                        <Card className="h-100 d-flex flex-column">
                            <CardHeader className="bg-light p-3 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Preview</h5>
                                <Badge color="secondary" pill>Page {activeIndex + 1} of {pages.length}</Badge>
                            </CardHeader>
                            <CardBody className="p-1 flex-grow-1 position-relative d-flex align-items-center justify-content-center" style={{ height: '65vh', background: '#e9ecef', overflow: 'hidden' }}>
                                <iframe
                                    key={activePage?.id}
                                    ref={iframeRef}
                                    src="/highlighter.html"
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    title="Document Highlighter"
                                ></iframe>
                                {activePage && <div className="zoom-controls">
                                    <Button size="sm" color="light" onClick={handleRotateLeft} title="Rotate Left"><i className="ri-anticlockwise-2-line"></i></Button>
                                    <Button size="sm" color="light" onClick={handleRotateRight} title="Rotate Right"><i className="ri-clockwise-2-line"></i></Button>
                                    <Button size="sm" color="light" onClick={handleZoomIn} title="Zoom In"><i className="ri-zoom-in-line"></i></Button>
                                    <Button size="sm" color="light" onClick={handleZoomOut} title="Zoom Out"><i className="ri-zoom-out-line"></i></Button>
                                    <Button size="sm" color="light" onClick={handleResetView} title="Fit to Screen"><i className="ri-fullscreen-exit-line"></i></Button>
                                </div>}
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={5} className="d-flex flex-column">
                        <div className="d-flex justify-content-center mb-2">
                            <Button color="light" size="sm" onClick={previous}><i className="ri-arrow-left-s-line align-middle"></i> Prev</Button>
                            <span className="align-self-center mx-3">Page {activeIndex + 1} of {pages.length}</span>
                            <Button color="light" size="sm" onClick={next}>Next <i className="ri-arrow-right-s-line align-middle"></i></Button>
                        </div>
                        <Card className="mb-3">
                            <CardHeader className="bg-light p-3">
                                <h6 className="mb-0"><i className="ri-information-line me-2 text-muted"></i>Consumer Info</h6>
                            </CardHeader>
                            <CardBody className="p-2">
                                {scannedData && scannedData.doc ? (
                                    <ListGroup flush className="small">
                                        <ListGroupItem className="px-2 py-2 border-0 d-flex justify-content-between">
                                            <strong>Consumer Name:</strong>
                                            <span className="text-muted">{scannedData.doc.consumer_name}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className="px-2 py-2 border-0 d-flex justify-content-between">
                                            <strong>RR No:</strong>
                                            <span className="text-muted">{scannedData.doc.rr_no}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className="px-2 py-2 border-0 d-flex justify-content-between">
                                            <strong>Account ID:</strong>
                                            <span className="text-muted">{scannedData.doc.account_id}</span>
                                        </ListGroupItem>
                                        <ListGroupItem className="px-2 py-2 border-0 d-flex justify-content-between align-items-center">
                                            <strong className="me-2">Document Type:<span className="text-danger">*</span></strong>
                                            <DocumentTypeDropdown
                                                value={scannedData.doc.category}
                                                onChange={(e) => {
                                                    const newCategory = e.target.value;
                                                    const isOther = newCategory === 'other';
                                                    setScannedDocumentData(prev => ({
                                                        ...prev,
                                                        doc: { ...prev.doc, category: newCategory },
                                                        isOther: isOther,
                                                        docName: isOther ? prev.docName : ''
                                                    }));
                                                }}
                                                documentTypes={documentTypes}
                                                placeholder="Select Type..."
                                            />
                                        </ListGroupItem>
                                    </ListGroup>
                                ) : (
                                    <div className="text-center text-muted p-3 small">
                                        <p className="mb-0">Consumer information will be displayed here.</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                        {scannedData.isOther && (
                            <Card className="mb-3"><CardHeader className="bg-light p-3"><h6 className="mb-0">Document Details</h6></CardHeader><CardBody className="p-3">
                                <p className="text-muted small mb-2">This document type requires a name.</p>
                                <div className="mb-2"><label htmlFor="docName" className="form-label small">Document Name <span className="text-danger">*</span></label><Input id="docName" type="text" placeholder="e.g., NOC Certificate" value={scannedData.docName} onChange={(e) => onDataChange('docName', e.target.value)} /></div>
                                <div><label htmlFor="docRef" className="form-label small">Reference (Optional)</label><Input id="docRef" type="text" placeholder="e.g., NOC-12345" value={scannedData.docRef} onChange={(e) => onDataChange('docRef', e.target.value)} /></div>
                            </CardBody></Card>
                        )}
                        <Card className="mb-3">
                            <CardHeader className="bg-light p-3 d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">Meta Tags</h6>
                                <Button
                                    size="sm"
                                    color="secondary"
                                    outline
                                    onClick={handleRunOcr}
                                    disabled={ocrStatus === 'running' || !activePage?.blob}
                                    title="Recognize text to click and add as tags"
                                >
                                    {ocrStatus === 'running' ? <Spinner size="sm" className="me-1" /> : <i className="ri-scan-line me-1"></i>}
                                    {ocrStatus === 'running' ? 'Processing...' : 'Run OCR'}
                                </Button>
                            </CardHeader>
                            <CardBody className="p-2">
                                <TagEditor key={scannedData.tags.join(',')} tags={scannedData.tags} onAddTag={(tag) => onDataChange('tags', [...scannedData.tags, tag])} onRemoveTag={(tag) => onDataChange('tags', scannedData.tags.filter(t => t !== tag))} />
                            </CardBody>
                        </Card>
                        <Card className="flex-grow-1"><CardHeader className="bg-light p-3"><h6 className="mb-0">Response / Comments</h6></CardHeader><CardBody className="p-2"><Input type="textarea" rows={3} placeholder="Enter comments..." value={scannedData.responseText} onChange={(e) => onDataChange('responseText', e.target.value)} /></CardBody></Card>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter className="d-flex justify-content-between align-items-center">
                <div>
                    <Button color="light" onClick={onRescan} disabled={isActionInProgress} className="me-2"><i className="ri-scan-2-line me-1"></i> Rescan Page</Button>
                    <Button color="secondary" onClick={onAddPage} disabled={isActionInProgress}><i className="ri-add-line me-1"></i> Add Page</Button>
                </div>
                <div className="d-flex flex-column align-items-end">
                    {!canSubmit && (
                        <small className="text-danger mb-1 fw-bold">
                            <i className="ri-error-warning-line me-1"></i>
                            Please select a Document Type to submit.
                        </small>
                    )}
                    <Button
                        color="primary"
                        onClick={onSubmit}
                        disabled={isActionInProgress || !canSubmit}
                    >
                        {isSubmittingDraft ? (
                            <><Spinner size="sm" className="me-1" /> Submitting...</>
                        ) : (
                            <><i className="ri-check-line me-1"></i> Submit Document</>
                        )}
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

// --- MAIN COMPONENT ---
const DocumentReview = () => {
    document.title = `Scan and review | DMS`;
    const navigate = useNavigate();
    const location = useLocation();
    const consumerData = location.state?.consumerData;

    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [documentsForReview, setDocumentsForReview] = useState(location.state?.draftDocuments || []);
    const [selectedFile, setSelectedFile] = useState(null);
    const [setFileTypeFilter] = useState('all');
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(true);
    const [scannedHighlights, setScannedHighlights] = useState([]);
    const [metaTags, setMetaTags] = useState([]);
    const [responseText, setResponseText] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [scanningInProgress, setScanningInProgress] = useState(false);
    const [currentScanFileName, setCurrentScanFileName] = useState('');

    const scanTimeoutIdRef = useRef(null);
    const progressIntervalRef = useRef(null);

    const documentsForReviewRef = useRef(documentsForReview);
    useEffect(() => {
        documentsForReviewRef.current = documentsForReview;
    }, [documentsForReview]);

    const [isScanningModalOpen, setIsScanningModalOpen] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [isScanPreviewModalOpen, setIsScanPreviewModalOpen] = useState(false);
    const [scannedDocumentData, setScannedDocumentData] = useState(null);
    const [isAddingPage, setIsAddingPage] = useState(false);
    const [isAddingPageLoading, setIsAddingPageLoading] = useState(false);
    const [scanModalActiveIndex, setScanModalActiveIndex] = useState(0);
    const [isRescanning, setIsRescanning] = useState(false);
    const [pageToRescanId, setPageToRescanId] = useState(null);
    const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
    const [isBulkScanning, setIsBulkScanning] = useState(false);
    const [verificationDetails, setVerificationDetails] = useState(null);

    useEffect(() => {
        if (consumerData) {
            setVerificationDetails({
                noOfPages: consumerData.noOfPages,
                fileNumber: consumerData.fileNumber,
                contractorName: consumerData.contractorName,
                approvedBy: consumerData.approvedBy,
                category: consumerData.category
            });
        }
    }, [consumerData]);

    useEffect(() => {
        const socketConnection = io(SCANNER_ENDPOINT, { transports: ["websocket", "polling"] });
        setSocket(socketConnection);

        return () => {
            socketConnection.disconnect();
            if (scanTimeoutIdRef.current) {
                clearTimeout(scanTimeoutIdRef.current);
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleScanResponse = async (data) => {
            if (isBulkScanning && data.type === "pdf" && data.images) {
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
                if (scanTimeoutIdRef.current) {
                    clearTimeout(scanTimeoutIdRef.current);
                    scanTimeoutIdRef.current = null;
                }

                try {
                    const pagePromises = data.images.map(async (imageUrl, index) => {
                        const fullImageUrl = `${SCANNER_ENDPOINT}${imageUrl}`;
                        const fileResponse = await fetch(fullImageUrl);
                        if (!fileResponse.ok) throw new Error(`Failed to fetch scanned page ${index + 1}`);
                        const blob = await fileResponse.blob();
                        const previewUrl = URL.createObjectURL(blob);
                        const dimensions = await getImageDimensions(blob);

                        return {
                            blob, previewUrl, type: blob.type, name: `page_${index + 1}.jpg`,
                            id: `page_${Date.now()}_${index}`, zoom: 1, rotation: 0,
                            dimensions: dimensions, isFitCalculated: false, isFitted: true,
                        };
                    });

                    const newPages = await Promise.all(pagePromises);

                    if (newPages.length === 0) {
                        throw new Error("Bulk scan completed but returned no pages.");
                    }

                    const newDoc = {
                        id: Date.now(), name: "BulkScannedDocument.pdf", type: 'application/pdf',
                        category: 'all',
                        createdAt: new Date().toISOString().split('T')[0],
                        createdBy: 'scanner', description: 'Newly scanned bulk document',
                        rr_no: consumerData.rr_no, consumer_name: consumerData.consumer_name,
                        account_id: consumerData.account_id,
                        pages: newPages,
                        comment: '',
                        tags: ['scanned', 'new', 'bulk'],
                    };

                    setScanModalActiveIndex(0);
                    setScannedDocumentData({
                        doc: newDoc,
                        highlights: [{ type: 'Header', text: 'Bulk Scanned Document' }, { type: 'Footer', text: `Scanned on: ${newDoc.createdAt}` }, { type: 'Word', text: newDoc.consumer_name },],
                        tags: newDoc.tags,
                        responseText: '',
                        isOther: false,
                        docName: '',
                        docRef: ''
                    });
                    setIsScanPreviewModalOpen(true);
                    setIsScanningModalOpen(false);
                    setIsBulkScanning(false);
                    setScanningInProgress(false);

                } catch (error) {
                    setResponse(error.message || "Could not retrieve the scanned bulk pages.");
                    setErrorModal(true);
                    setIsScanningModalOpen(false);
                    setIsBulkScanning(false);
                    setScanningInProgress(false);
                }
            }
            else if (scanningInProgress && currentScanFileName && data.fileName && data.fileName.includes(currentScanFileName)) {
                if (scanTimeoutIdRef.current) {
                    clearTimeout(scanTimeoutIdRef.current);
                    scanTimeoutIdRef.current = null;
                }
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }

                try {
                    const fullImageUrl = `${SCANNER_ENDPOINT}${data.imageUrl}`;
                    const fileResponse = await fetch(fullImageUrl);
                    if (!fileResponse.ok) throw new Error('Failed to fetch scanned image file from server.');
                    const blob = await fileResponse.blob();
                    const previewUrl = URL.createObjectURL(blob);
                    const dimensions = await getImageDimensions(blob);

                    const newPage = {
                        blob, previewUrl, type: blob.type, name: data.fileName,
                        id: `page_${Date.now()}`, zoom: 1, rotation: 0,
                        dimensions: dimensions,
                        isFitCalculated: false,
                        isFitted: true,
                    };

                    if (pageToRescanId) {
                        setScannedDocumentData(prev => {
                            if (!prev) return null;
                            const pageIndex = prev.doc.pages.findIndex(p => p.id === pageToRescanId);
                            const updatedPages = [...prev.doc.pages];
                            if (pageIndex !== -1) {
                                updatedPages[pageIndex] = newPage;
                            } else {
                                updatedPages.push(newPage);
                            }
                            return { ...prev, doc: { ...prev.doc, pages: updatedPages } };
                        });
                        setIsRescanning(false);
                        setPageToRescanId(null);
                    } else if (isAddingPage) {
                        setScannedDocumentData(prev => {
                            const newPages = [...prev.doc.pages, newPage];
                            setScanModalActiveIndex(newPages.length - 1);
                            return { ...prev, doc: { ...prev.doc, pages: newPages } };
                        });
                        setIsAddingPage(false);
                        setIsAddingPageLoading(false);
                    } else {
                        const newDoc = {
                            id: Date.now(), name: data.fileName, type: blob.type,
                            category: 'all',
                            createdAt: new Date().toISOString().split('T')[0],
                            createdBy: 'scanner', description: 'Newly scanned document',
                            rr_no: consumerData.rr_no, consumer_name: consumerData.consumer_name,
                            account_id: consumerData.account_id,
                            pages: [newPage],
                            comment: '',
                            tags: ['scanned', 'new'],
                        };
                        setScanModalActiveIndex(0);
                        setScannedDocumentData({
                            doc: newDoc,
                            highlights: [{ type: 'Header', text: 'Scanned Document' }, { type: 'Footer', text: `Scanned on: ${newDoc.createdAt}` }, { type: 'Word', text: newDoc.consumer_name },],
                            tags: newDoc.tags,
                            responseText: '',
                            isOther: false,
                            docName: '',
                            docRef: ''
                        });
                        setIsScanPreviewModalOpen(true);
                    }
                    setIsScanningModalOpen(false);
                    setScanningInProgress(false);

                } catch (error) {
                    setResponse(error.message || "Could not retrieve the scanned file.");
                    setErrorModal(true);
                    setScanningInProgress(false);
                    setIsScanningModalOpen(false);
                    setIsAddingPage(false);
                    setIsAddingPageLoading(false);
                    setIsRescanning(false);
                    setPageToRescanId(null);
                }
            }
        };

        socket.on("new-scan-processed", handleScanResponse);
        return () => { socket.off("new-scan-processed", handleScanResponse); };

    }, [
        socket,
        scanningInProgress,
        currentScanFileName,
        isBulkScanning,
        consumerData,
        isAddingPage,
        pageToRescanId
    ]);

    useEffect(() => {
        const fetchDocumentTypes = async () => {
            try {
                setLoadingDocumentTypes(true);
                const userEmail = JSON.parse(sessionStorage.getItem('authUser'))?.user?.Email || "admin";
                const response = await getDocumentDropdowns({ flagId: 9, requestUserName: userEmail });
                if (response?.status === "success" && response.data) setDocumentTypes(response.data);
                else setDocumentTypes([{ DocumentList_Id: 1, DocumentListName: "Aadhar Card" }]);
            } catch (error) {
                setDocumentTypes([{ DocumentList_Id: 1, DocumentListName: "Aadhar Card" }]);
            } finally { setLoadingDocumentTypes(false); }
        };
        fetchDocumentTypes();
    }, []);

    const handleCommentChange = (newComment) => {
        setResponseText(newComment);
        if (selectedFile) {
            setDocumentsForReview(prevDocs => prevDocs.map(doc =>
                doc.id === selectedFile.id ? { ...doc, comment: newComment } : doc
            ));
        }
    };

    const handleTagsChange = (newTags) => {
        setMetaTags(newTags);
        if (selectedFile) {
            setDocumentsForReview(prevDocs => prevDocs.map(doc =>
                doc.id === selectedFile.id ? { ...doc, tags: newTags } : doc
            ));
        }
    };

    const handleFileSelect = useCallback(async (doc) => {
        setSelectedFile(doc);
        setPreviewLoading(true);
        setPreviewError(null);

        setResponseText(doc.comment || doc.DraftDescription || '');
        setMetaTags(doc.tags || (doc.MetaTags ? doc.MetaTags.split(',') : []));
        setScannedHighlights([
            { type: 'Header', text: 'Draft Document' },
            { type: 'Footer', text: doc.createdAt || doc.UploadedAt || 'Unknown Date' },
            { type: 'Word', text: doc.consumer_name || consumerData?.consumer_name || 'Consumer' }
        ]);

        const docId = doc.Draft_Id || doc.draftId;

        if (!docId) {
            if (doc.previewUrl) {
                setPreviewLoading(false);
                return;
            }
            setPreviewLoading(false);
            return;
        }

        try {
            const requestPayload = {
                flagId: 4,
                Draft_Id: docId,
            };

            const response = await axios.post(
                VIEW_DOCUMENT_URL,
                requestPayload,
                { responseType: "blob" }
            );

            let blobData = response.data ? response.data : response;
            const headers = response.headers || {};
            let contentType = headers['content-type'] || headers['Content-Type'];

            if (!(blobData instanceof Blob)) {
                blobData = new Blob([blobData], { type: contentType || 'application/octet-stream' });
            }

            if (blobData.type === 'application/json' || contentType === 'application/json') {
                const text = await blobData.text();
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.message || json.error || "Server returned an error.");
                } catch (e) {
                    if (e.message !== "Server returned an error.") throw e;
                }
            }

            const fileName = doc.name || doc.DraftName || "document.jpg";
            let finalType = blobData.type;

            if (!finalType || finalType === 'application/octet-stream') {
                if (fileName.match(/\.pdf$/i)) finalType = 'application/pdf';
                else if (fileName.match(/\.(jpeg|jpg)$/i)) finalType = 'image/jpeg';
                else if (fileName.match(/\.png$/i)) finalType = 'image/png';
                blobData = blobData.slice(0, blobData.size, finalType);
            }

            const fileUrl = URL.createObjectURL(blobData);

            const hydratedFile = {
                ...doc,
                previewUrl: fileUrl,
                fileObject: new File([blobData], fileName, { type: finalType }),
                type: finalType
            };

            setDocumentsForReview(prev => prev.map(d => d.id === hydratedFile.id ? hydratedFile : d));
            setSelectedFile(hydratedFile);

        } catch (error) {
            setPreviewError(error.message || "Failed to load document.");
        } finally {
            setPreviewLoading(false);
        }
    }, [documentsForReview, consumerData]);

    useEffect(() => {
        if (documentsForReview.length > 0 && !selectedFile) {
            handleFileSelect(documentsForReview[0]);
        }
    }, [documentsForReview, selectedFile, handleFileSelect]);

    useEffect(() => {
        return () => {
            const docs = documentsForReviewRef.current;
            docs.forEach(doc => {
                if (doc.previewUrl && doc.previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(doc.previewUrl);
                }
            });
        };
    }, []);

    const handleSubmitReview = async () => {
        setLoading(true);
        const finalDocuments = documentsForReview;
        if (finalDocuments.length === 0) {
            setResponse(`Please scan at least one document.`);
            setErrorModal(true); setLoading(false); return;
        }
        const formData = new FormData();
        let user;
        try {
            const authUserString = sessionStorage.getItem('authUser');
            if (!authUserString) throw new Error("'authUser' not found.");
            user = JSON.parse(authUserString).user;
            if (!user || !user.User_Id || !user.Email) throw new Error("User ID or Email not found in session.");
        } catch (error) {
            setResponse("Your user session is invalid. Please log in again.");
            setErrorModal(true); setLoading(false); return;
        }
        if (!consumerData) {
            setResponse("Consumer data is missing. Please try again.");
            setErrorModal(true); setLoading(false); return;
        }

        if (verificationDetails) {
            formData.append('NoOfPages', verificationDetails.noOfPages || '');
            formData.append('FileNumber', verificationDetails.fileNumber || '');
            formData.append('ContractorName', verificationDetails.contractorName || '');
            formData.append('ApprovedBy', verificationDetails.approvedBy || '');
            formData.append('CategoryName', verificationDetails.category || '');
        }

        formData.append('flagId', '10');
        formData.append('DocumentName', `Docs for ${consumerData.rr_no}`);
        formData.append('DocumentDescription', responseText);
        formData.append('MetaTags', metaTags.join(','));
        formData.append('CreatedByUser_Id', user.User_Id);
        formData.append('account_id', consumerData.account_id);
        formData.append('CreatedByUserName', user.Email);
        formData.append('div_code', consumerData.div_code || '');
        formData.append('sd_code', consumerData.sd_code || '');
        formData.append('so_code', consumerData.so_code || '');
        formData.append('Category_Id', '1');
        formData.append('Status_Id', '1');
        let fileCount = 0;

        const predefinedApiKeys = new Set(documentTypes.map(d => d.DocumentListName.replace(/[^a-zA-Z0-9]/g, '')));

        finalDocuments.forEach(doc => {
            const catName = doc.category || doc.DraftName || 'OtherDocuments';
            const potentialApiKey = catName.replace(/[^a-zA-Z0-9]/g, '');
            const apiKey = predefinedApiKeys.has(potentialApiKey) ? potentialApiKey : 'OtherDocuments';
            if (doc.fileObject && apiKey) {
                formData.append(apiKey, doc.fileObject, doc.name || doc.DraftName);
                fileCount++;
            }
        });

        if (fileCount === 0) {
            setResponse("No valid file data found to upload. Please rescan.");
            setErrorModal(true); setLoading(false); return;
        }
        try {
            const apiResponse = await postDocumentUpload(formData);
            if (apiResponse?.status === 'success') {
                setResponse(apiResponse.message || `Successfully uploaded files.`);
                setSuccessModal(true);
            } else {
                throw new Error(apiResponse?.message || 'Submission failed.');
            }
        } catch (error) {
            setResponse(error?.message || "An unknown error occurred.");
            setErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessAndNavigate = () => {
        setSuccessModal(false);
        navigate('/Preview', { state: { refresh: true } });
    };

    const handleApiScan = async (docTypeLabel) => {
        if (!socket || !socket.connected) {
            setResponse("Scanner is not connected. Please try again.");
            setErrorModal(true);
            setIsAddingPage(false);
            setIsAddingPageLoading(false);
            setIsRescanning(false);
            setPageToRescanId(null);
            return;
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseFileName = `${docTypeLabel.replace(/\s+/g, '_')}_${timestamp}`;
        const fileNameForApi = `${baseFileName}.jpg`;

        setScanningInProgress(true);
        setCurrentScanFileName(baseFileName);

        if (!isAddingPage && !isRescanning) {
            setIsScanningModalOpen(true);
        }

        setScanProgress(0);
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
        progressIntervalRef.current = setInterval(() => setScanProgress(prev => Math.min(prev + 10, 90)), 250);

        try {
            await axios.post(`${SCANNER_ENDPOINT}/scan-service/scan`, { fileName: fileNameForApi, format: "jpg", colorMode: "color" }, { timeout: 30000 });

            if (scanTimeoutIdRef.current) {
                clearTimeout(scanTimeoutIdRef.current);
            }
            scanTimeoutIdRef.current = setTimeout(() => {
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
                setScanningInProgress(false);
                setCurrentScanFileName('');
                setIsAddingPage(false);
                setIsAddingPageLoading(false);
                setIsScanningModalOpen(false);
                setIsRescanning(false);
                setPageToRescanId(null);
                setResponse('Scan timed out. The scanner did not respond.');
                setErrorModal(true);
                scanTimeoutIdRef.current = null;
            }, 30000);

        } catch (error) {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            if (scanTimeoutIdRef.current) {
                clearTimeout(scanTimeoutIdRef.current);
                scanTimeoutIdRef.current = null;
            }
            setScanningInProgress(false);
            setCurrentScanFileName('');
            setIsAddingPage(false);
            setIsAddingPageLoading(false);
            setIsScanningModalOpen(false);
            setIsRescanning(false);
            setPageToRescanId(null);

            setResponse(error?.message || 'Error initiating scan. Check network and scanner connection.');
            setErrorModal(true);
        }
    };

    const handleScanClick = () => {
        setIsAddingPage(false);
        setIsRescanning(false);
        const docTypeLabel = 'Scanned_Document';
        handleApiScan(docTypeLabel);
    };

    const handleBulkScan = async () => {
        if (!socket || !socket.connected) {
            setResponse("Scanner is not connected. Please try again.");
            setErrorModal(true);
            return;
        }

        setIsBulkScanning(true);
        setScanningInProgress(true);
        setIsScanningModalOpen(true);
        setScanProgress(0);

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
        progressIntervalRef.current = setInterval(() => setScanProgress(prev => Math.min(prev + 1, 95)), 1000);

        const payload = {
            deviceName: "Canon MF460 ser_6CF2D8AE9F40",
            fileName: "ProjectDocsBatch.pdf",
            format: "pdf"
        };

        const BULK_TIMEOUT_MS = 600000;

        try {
            await axios.post(`${SCANNER_ENDPOINT}/scan-service/bulk-scan`, payload, { timeout: BULK_TIMEOUT_MS });

            if (scanTimeoutIdRef.current) {
                clearTimeout(scanTimeoutIdRef.current);
            }

            scanTimeoutIdRef.current = setTimeout(() => {
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
                setScanningInProgress(false);
                setIsBulkScanning(false);
                setIsScanningModalOpen(false);
                setResponse('Bulk Scan timed out. The scanner is taking too long to respond.');
                setErrorModal(true);
                scanTimeoutIdRef.current = null;
            }, BULK_TIMEOUT_MS);

        } catch (error) {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            if (scanTimeoutIdRef.current) {
                clearTimeout(scanTimeoutIdRef.current);
                scanTimeoutIdRef.current = null;
            }
            setIsScanningModalOpen(false);
            setIsBulkScanning(false);
            setScanningInProgress(false);

            const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
            const errorMsg = isTimeout
                ? "The scanner is taking a long time. If the scanner is still moving, please wait."
                : (error?.message || 'Error initiating bulk scan. Check scanner connection.');

            setResponse(errorMsg);
            setErrorModal(true);
        }
    };

    const handleAddPageScan = () => {
        if (!scannedDocumentData) return;
        setIsAddingPage(true);
        setIsAddingPageLoading(true);
        const docTypeLabel = scannedDocumentData.doc.category;
        handleApiScan(docTypeLabel);
    };

    const handleRescan = () => {
        if (!scannedDocumentData || !scannedDocumentData.doc.pages[scanModalActiveIndex]) return;

        const pageToReplace = scannedDocumentData.doc.pages[scanModalActiveIndex];
        setPageToRescanId(pageToReplace.id);
        setIsRescanning(true);

        const docTypeLabel = scannedDocumentData.doc.category;
        handleApiScan(docTypeLabel);
    };

    const handleCloseScanPreview = () => {
        setIsScanPreviewModalOpen(false);
        setScannedDocumentData(null);
        setFileTypeFilter('all');
    };

    const getRotatedImageBlob = (imageFile, rotation) => {
        return new Promise((resolve, reject) => {
            const imageUrl = URL.createObjectURL(imageFile);
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const angle = (rotation % 360) * Math.PI / 180;

                const isSideways = (rotation % 180 !== 0);
                canvas.width = isSideways ? img.height : img.width;
                canvas.height = isSideways ? img.width : img.height;

                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(angle);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);

                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(imageUrl);
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob conversion failed'));
                }, 'image/jpeg', 0.9);
            };
            img.onerror = (error) => {
                URL.revokeObjectURL(imageUrl);
                reject(error);
            };
            img.src = imageUrl;
        });
    };

    const handleSubmitScannedDocument = async () => {
        if (!scannedDocumentData) return;

        setIsSubmittingDraft(true);

        let user;
        try {
            const authUserString = sessionStorage.getItem('authUser');
            if (!authUserString) throw new Error("'authUser' not found.");
            user = JSON.parse(authUserString).user;
            if (!user || !user.User_Id || !user.Email) throw new Error("User ID or Email not found in session.");
        } catch (error) {
            setResponse("Your user session is invalid. Please log in again.");
            setErrorModal(true);
            setIsSubmittingDraft(false);
            return;
        }

        if (!consumerData) {
            setResponse("Consumer data is missing. Please try again.");
            setErrorModal(true);
            setIsSubmittingDraft(false);
            return;
        }

        const { doc, isOther, docName, docRef, responseText, tags } = scannedDocumentData;

        try {
            if (doc.pages.length > 1) {
                const newlyAddedDocuments = [];
                let uploadFailed = false;

                for (let i = 0; i < doc.pages.length; i++) {
                    const page = doc.pages[i];

                    try {
                        const blobToProcess = page.rotation % 360 !== 0
                            ? await getRotatedImageBlob(page.blob, page.rotation)
                            : page.blob;

                        const finalCategory = isOther ? docName.trim() : doc.category;
                        const baseName = finalCategory.replace(/[^a-zA-Z0-9]/g, '_');
                        const finalDocName = `Scanned_${baseName}_Page_${i + 1}.jpg`;

                        const finalFileObject = new File([blobToProcess], finalDocName, { type: 'image/jpeg' });
                        const finalPreviewUrl = URL.createObjectURL(blobToProcess);

                        let finalDoc = {
                            ...doc,
                            id: Date.now() + i,
                            comment: responseText,
                            tags: tags,
                            fileObject: finalFileObject,
                            previewUrl: finalPreviewUrl,
                            name: finalDocName,
                            type: finalFileObject.type,
                            category: finalCategory,
                            description: doc.description || 'Newly scanned document.',
                        };

                        if (isOther && docRef.trim()) {
                            finalDoc.description += ` (Ref: ${docRef.trim()}, Page ${i + 1})`;
                        }

                        const formData = new FormData();
                        formData.append('flagId', '12');
                        formData.append('DraftName', finalDoc.name);
                        formData.append('DraftDescription', finalDoc.comment || 'Newly scanned document.');
                        formData.append('MetaTags', finalDoc.tags.join(','));
                        formData.append('CreatedByUser_Id', user.User_Id);
                        formData.append('Account_Id', consumerData.account_id);
                        formData.append('CreatedByUserName', user.Email);
                        formData.append('div_code', consumerData.div_code || '');
                        formData.append('sd_code', consumerData.sd_code || '');
                        formData.append('so_code', consumerData.so_code || '');
                        formData.append('Category_Id', '1');
                        formData.append('Role_Id', '');
                        formData.append('DraftFile', finalDoc.fileObject);

                        const apiResponse = await postDocumentUpload(formData);

                        if (apiResponse?.status === 'success') {
                            finalDoc.draftId = apiResponse.draftId;
                            finalDoc.documentId = apiResponse.documentId;
                            delete finalDoc.pages;
                            newlyAddedDocuments.push(finalDoc);
                        } else {
                            throw new Error(apiResponse?.message || `Failed to save draft for page ${i + 1}.`);
                        }

                    } catch (error) {
                        const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred.";
                        setResponse(`Failed to upload page ${i + 1}: ${errorMessage}. Aborting remaining uploads.`);
                        setErrorModal(true);
                        uploadFailed = true;
                        break;
                    }
                }

                setDocumentsForReview(prevDocs => [...newlyAddedDocuments, ...prevDocs]);
                setIsScanPreviewModalOpen(false);
                setScannedDocumentData(null);
                setFileTypeFilter('all');

                if (newlyAddedDocuments.length > 0 && !uploadFailed) {
                    setTimeout(() => handleFileSelect(newlyAddedDocuments[0]), 100);
                }

            } else if (doc.pages.length === 1) {
                let finalFileObject, finalPreviewUrl;
                let finalDocName = doc.name;

                try {
                    const singlePage = doc.pages[0];
                    finalDocName = singlePage.name.endsWith('.jpg') ? singlePage.name : `${singlePage.name}.jpg`;
                    if (singlePage.rotation % 360 !== 0) {
                        const rotatedBlob = await getRotatedImageBlob(singlePage.blob, singlePage.rotation);
                        finalFileObject = new File([rotatedBlob], finalDocName, { type: 'image/jpeg' });
                        finalPreviewUrl = URL.createObjectURL(rotatedBlob);
                    } else {
                        finalFileObject = new File([singlePage.blob], finalDocName, { type: singlePage.type });
                        finalPreviewUrl = singlePage.previewUrl;
                    }
                } catch (error) {
                    setResponse("Failed to process the scanned page. Please try again.");
                    setErrorModal(true);
                    setIsSubmittingDraft(false);
                    return;
                }

                let finalDoc = {
                    ...scannedDocumentData.doc,
                    comment: scannedDocumentData.responseText,
                    tags: scannedDocumentData.tags,
                    fileObject: finalFileObject,
                    previewUrl: finalPreviewUrl,
                    name: finalDocName,
                    type: finalFileObject.type,
                };

                if (scannedDocumentData.isOther) {
                    const finalName = scannedDocumentData.docName.trim();
                    finalDoc.category = finalName;
                    const extension = finalDoc.name.split('.').pop();
                    const newName = `Scanned_${finalName.replace(/\s+/g, '_')}.${extension}`;
                    finalDoc.name = newName;
                    finalDoc.fileObject = new File([finalFileObject], newName, { type: finalFileObject.type });
                    if (scannedDocumentData.docRef.trim()) {
                        finalDoc.description += ` (Ref: ${scannedDocumentData.docRef.trim()})`;
                    }
                }
                delete finalDoc.pages;

                const formData = new FormData();
                formData.append('flagId', '12');
                formData.append('DraftName', finalDoc.name);
                formData.append('DraftDescription', finalDoc.comment || 'Newly scanned document.');
                formData.append('MetaTags', finalDoc.tags.join(','));
                formData.append('CreatedByUser_Id', user.User_Id);
                formData.append('Account_Id', consumerData.account_id);
                formData.append('CreatedByUserName', user.Email);
                formData.append('div_code', consumerData.div_code || '');
                formData.append('sd_code', consumerData.sd_code || '');
                formData.append('so_code', consumerData.so_code || '');
                formData.append('Category_Id', '1');
                formData.append('Role_Id', '');
                formData.append('DraftFile', finalDoc.fileObject);

                try {
                    const apiResponse = await postDocumentUpload(formData);

                    if (apiResponse?.status === 'success') {
                        const draftId = apiResponse.draftId;
                        const documentId = apiResponse.documentId;
                        finalDoc.draftId = draftId;
                        finalDoc.documentId = documentId;

                        setDocumentsForReview(prevDocs => [finalDoc, ...prevDocs]);
                        setIsScanPreviewModalOpen(false);
                        setScannedDocumentData(null);
                        setFileTypeFilter('all');
                        setTimeout(() => handleFileSelect(finalDoc), 100);

                    } else {
                        throw new Error(apiResponse?.message || 'Failed to save document draft.');
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while uploading the draft.";
                    setResponse(errorMessage);
                    setErrorModal(true);
                }

            } else {
                setResponse("No pages were scanned for this document.");
                setErrorModal(true);
                return;
            }
        } catch (error) {
            setResponse(error.message || "An unexpected error occurred while processing pages.");
            setErrorModal(true);
        } finally {
            setIsSubmittingDraft(false);
        }
    };

    const DocumentTypeDropdown = ({ value, onChange, documentTypes, placeholder }) => (
        <Input type="select" value={value} onChange={onChange}>
            <option value="all">{placeholder}</option>
            {documentTypes
                .filter(doc => !doc.DocumentListName.toLowerCase().includes('other'))
                .map((docType) => (
                    <option key={docType.DocumentList_Id} value={docType.DocumentListName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}>
                        {docType.DocumentListName}
                    </option>
                ))}
            <option value="other">Other...</option>
        </Input>
    );

    if (!consumerData) {
        return (
            <div className="page-content"><Container>
                <Alert color="danger" className="text-center">
                    <h4 className="alert-heading">Error!</h4>
                    <p>No consumer data found. Please return to the search page.</p><hr />
                    <Link to="/Preview" className="btn btn-danger">Go Back</Link>
                </Alert>
            </Container></div>
        );
    }

    return (
        <div className="page-content">
            <BreadCrumb title="Document Review" pageTitle="Documents" />
            <Container fluid>
                <SuccessModal show={successModal} onCloseClick={handleSuccessAndNavigate} successMsg={response} />
                <ErrorModal show={errorModal} onCloseClick={() => setErrorModal(false)} errorMsg={response} />
                <Card>
                    <CardHeader className="bg-primary bg-gradient p-2 d-flex align-items-center flex-wrap gap-3">
                        <div className="d-flex align-items-center rounded-pill bg-white bg-opacity-25 text-white py-2 px-3 shadow-sm">
                            <i className="ri-user-line me-2 fs-4 text-warning"></i>
                            <span className="me-2 opacity-75 fs-5">Consumer name:</span>
                            <h5 className="mb-0 fw-bold text-white">{consumerData.consumer_name}</h5>
                        </div>
                        <div className="d-flex align-items-center rounded-pill bg-white bg-opacity-25 text-white py-2 px-3 shadow-sm">
                            <i className="ri-hashtag me-2 fs-4 text-info"></i>
                            <span className="me-2 opacity-75 fs-5">Account ID:</span>
                            <h5 className="mb-0 fw-bold text-white">{consumerData.account_id}</h5>
                        </div>
                        <div className="d-flex align-items-center rounded-pill bg-white bg-opacity-25 text-white py-2 px-3 shadow-sm">
                            <i className="ri-file-list-3-line me-2 fs-4"></i>
                            <span className="me-2 opacity-75 fs-5">RR No:</span>
                            <h5 className="mb-0 fw-bold text-white">{consumerData.rr_no}</h5>
                        </div>
                        <div className="d-flex align-items-center rounded-pill bg-white bg-opacity-25 text-white py-2 px-3 shadow-sm">
                            <i className="ri-price-tag-3-line me-2 fs-4 text-success"></i>
                            <span className="me-2 opacity-75 fs-5">Tariff:</span>
                            <h5 className="mb-0 fw-bold text-white">{consumerData.tariff || 'N/A'}</h5>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {documentsForReview.length === 0 ? (
                            <Row className="justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
                                <Col md={6} lg={5} className="text-center">
                                    <i className="ri-upload-cloud-line display-2 text-primary mb-3"></i>
                                    <h4>Please Upload Documents</h4>
                                    <p className="text-muted">To begin, click 'Scan' or 'Bulk Scan'.</p>
                                    <div className="mt-4">
                                        {loadingDocumentTypes ? (<div className="text-center"><Spinner size="sm" /> Loading...</div>) : (
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button
                                                    color="primary"
                                                    size="lg"
                                                    onClick={handleScanClick}
                                                    disabled={scanningInProgress || isBulkScanning}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                        width="18" height="18"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                        className="me-1">
                                                        <path d="M3 3h6v2H5v4H3V3zm12 0h6v6h-2V5h-4V3zm6 12v6h-6v-2h4v-4h2zM3 15h2v4h4v2H3v-6zM7 7h10v10H7V7zm2 2v6h6V9H9z" />
                                                    </svg>
                                                    Scan
                                                </Button>
                                                <Button
                                                    color="secondary"
                                                    size="lg"
                                                    onClick={handleBulkScan}
                                                    disabled={scanningInProgress || isBulkScanning}
                                                >
                                                    <i className="ri-file-pdf-line me-1"></i>
                                                    Bulk Scan
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        ) : (
                            <>
                                <Row className="g-3 align-items-center mb-4">
                                    <Col md={5}>
                                        {loadingDocumentTypes ? (<div className="text-center"><Spinner size="sm" /> Loading...</div>) : (
                                            <div className="d-flex gap-2">
                                                <Button
                                                    color="primary"
                                                    onClick={handleScanClick}
                                                    disabled={scanningInProgress || isBulkScanning}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                        className="me-1"
                                                    >
                                                        <path d="M3 3h6v2H5v4H3V3zm12 0h6v6h-2V5h-4V3zm6 12v6h-6v-2h4v-4h2zM3 15h2v4h4v2H3v-6zM7 7h10v10H7V7zm2 2v6h6V9H9z" />
                                                    </svg>
                                                    Scan New
                                                </Button>
                                                <Button
                                                    color="secondary"
                                                    onClick={handleBulkScan}
                                                    disabled={scanningInProgress || isBulkScanning}
                                                >
                                                    <i className="ri-file-pdf-line me-1"></i>
                                                    Bulk Scan
                                                </Button>
                                            </div>
                                        )}
                                    </Col>
                                </Row>

                                <Row className="main-review-layout g-3 d-flex">
                                    <Col xl={3} lg={4} className="d-flex flex-column" style={{ height: '65vh' }}>
                                        <DocumentThumbnails documents={documentsForReview} selectedFile={selectedFile} onFileSelect={handleFileSelect} />
                                    </Col>

                                    <Col xl={6} lg={8} className="d-flex" style={{ height: '65vh' }}>
                                        <DocumentPreview file={selectedFile} loading={previewLoading} error={previewError} />
                                    </Col>

                                    <Col xl={3} lg={12} className="d-flex flex-column mt-3 mt-xl-0">
                                        <DocumentInfoPanel
                                            selectedFile={selectedFile} highlights={scannedHighlights} tags={metaTags}
                                            onTagsChange={handleTagsChange}
                                            comment={responseText}
                                            onCommentChange={(e) => handleCommentChange(e.target.value)}
                                            isVerified={isVerified} onVerifiedChange={setIsVerified} onSubmit={handleSubmitReview}
                                            loading={loading} canSubmit={documentsForReview.length > 0} readOnly={!selectedFile}
                                            verificationDetails={verificationDetails}
                                        />
                                    </Col>
                                </Row>
                            </>
                        )}
                    </CardBody>
                </Card>
                <ScanPreviewModal
                    isOpen={isScanPreviewModalOpen}
                    onClose={handleCloseScanPreview}
                    onRescan={handleRescan}
                    onAddPage={handleAddPageScan}
                    onSubmit={handleSubmitScannedDocument}
                    scannedData={scannedDocumentData}
                    onDataChange={(field, value) => setScannedDocumentData(prev => ({ ...prev, [field]: value }))}
                    activeIndex={scanModalActiveIndex}
                    setActiveIndex={setScanModalActiveIndex}
                    isAddingPageLoading={isAddingPageLoading}
                    isRescanning={isRescanning}
                    isSubmittingDraft={isSubmittingDraft}
                    setScannedDocumentData={setScannedDocumentData}
                    documentTypes={documentTypes}
                    DocumentTypeDropdown={DocumentTypeDropdown}
                />
                <Modal isOpen={isScanningModalOpen} centered backdrop="static">
                    <ModalHeader>Scanning Document</ModalHeader>
                    <ModalBody className="text-center py-4">
                        <Spinner className="mb-3" style={{ width: '3rem', height: '3rem' }} />
                        <h4>Scanning in Progress...</h4>
                        <p className="text-muted">Waiting for document from scanner.</p>
                        <Progress animated color="primary" value={scanProgress} className="mt-4" />
                    </ModalBody>
                </Modal>
                <style>{`
                    .thumbnail-pane { overflow-y: auto; }
                    .info-pane { display: flex; flex-direction: column; height: 100%; }
                    .zoom-controls { position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); background-color: rgba(255, 255, 255, 0.8); border-radius: 8px; padding: 5px; display: flex; gap: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 10; }
                    .thumbnail-card { cursor: pointer; transition: all 0.2s ease-in-out; border: 1px solid #e9ecef; background-color: #f8f9fa; }
                    .thumbnail-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                    .thumbnail-card.active { background-color: #e0e7ff; border-color: #405189; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                    .thumbnail-name { font-size: 11px; line-height: 1.2; }
                    .tag-badge { background-color: #f3f3f9; color: #495057; border: 1px solid #e9ecef; display: inline-flex; align-items: center; }
                    .btn-close-xs { background-size: 0.5em; opacity: 0.8; }
                    .tag-container {
                        max-height: 5.5rem;
                        overflow-y: auto;
                    }
                    .scanning-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(255, 255, 255, 0.9);
                        z-index: 1056;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        border-radius: 0 0 .3rem .3rem;
                    }
                `}</style>
            </Container>
        </div>
    );
};

export default DocumentReview;