import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, CardHeader, Col, Container, Row,
  Label, FormGroup, Input, Spinner, Button,
  Form
} from 'reactstrap';
import { getDocumentDropdowns } from '../../helpers/fakebackend_helper';
// Import the letterhead image from the specified path
import letterheadImg from './VishvinLetterHead.jpg';

const CreateIndent = () => {
  document.title = `Create Indent | DMS`;

  const [division, setDivision] = useState('');
  const [subDivision, setSubDivision] = useState('');
  const [section, setSection] = useState('');
  const [divisionName, setDivisionName] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // New states for the additional functionality
  const [submitToOption, setSubmitToOption] = useState('');
  const [availableOptions, setAvailableOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [indentData, setIndentData] = useState(null);

  const fetchDropdownData = async (flagId, params = {}) => {
    setLoading(true);
    try {
      const response = await getDocumentDropdowns({ flagId, ...params });
      if (response?.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching data for flagId ${flagId}:`, error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialDivisions = async () => {
      const divisions = await fetchDropdownData(1);
      setDivisionName(divisions);
    };
    loadInitialDivisions();
  }, []);

  const handleDivisionChange = async (e) => {
    const selectedDivCode = e.target.value;
    setDivision(selectedDivCode);
    setSubDivision('');
    setSection('');
    setSubDivisions([]);
    setSectionOptions([]);
    setSubmitToOption('');
    setAvailableOptions([]);
    setSelectedOptions([]);
    setIndentData(null);

    if (selectedDivCode) {
      const subDivs = await fetchDropdownData(2, { div_code: selectedDivCode });
      setSubDivisions(subDivs);
    }
  };

  const handleSubDivisionChange = async (e) => {
    const selectedSdCode = e.target.value;
    setSubDivision(selectedSdCode);
    setSection('');
    setSectionOptions([]);
    setSubmitToOption('');
    setAvailableOptions([]);
    setSelectedOptions([]);
    setIndentData(null);

    if (selectedSdCode) {
      const sections = await fetchDropdownData(3, { sd_code: selectedSdCode });
      setSectionOptions(sections);
    }
  };

  const handleSectionChange = (e) => {
    setSection(e.target.value);
    setSubmitToOption('');
    setAvailableOptions([]);
    setSelectedOptions([]);
    setIndentData(null);
  };

  const handleSubmitToChange = (e) => {
    const option = e.target.value;
    setSubmitToOption(option);
    setSelectedOptions([]);

    if (option === 'division') {
      // Show all subdivisions under the selected division
      setAvailableOptions(subDivisions);
    } else if (option === 'subdivision') {
      // Show all sections under the selected subdivision
      setAvailableOptions(sectionOptions);
    } else if (option === 'section') {
      // Remember the selected section
      const selectedSection = sectionOptions.find(sec => sec.so_code === section);
      if (selectedSection) {
        setAvailableOptions([selectedSection]);
        setSelectedOptions([section]);
      }
    }
  };

  const handleOptionSelection = (e, optionValue) => {
    if (e.target.checked) {
      setSelectedOptions([...selectedOptions, optionValue]);
    } else {
      setSelectedOptions(selectedOptions.filter(val => val !== optionValue));
    }
  };

  const handleRefresh = () => {
    setDivision('');
    setSubDivision('');
    setSection('');
    setSubmitToOption('');
    setAvailableOptions([]);
    setSelectedOptions([]);
    setIndentData(null);
  };

  const handleSubmit = () => {
    // Prepare indent data
    const selectedDivision = divisionName.find(div => div.div_code === division);
    const selectedSubDivision = subDivisions.find(sd => sd.sd_code === subDivision);
    const selectedSection = sectionOptions.find(sec => sec.so_code === section);

    // Get selected option names for display
    const selectedOptionNames = availableOptions
      .filter(opt => selectedOptions.includes(opt.so_code || opt.sd_code))
      .map(opt => opt.sub_division || opt.section_office)
      .join(' / ');

    // Determine designation based on submitToOption
    let designation = '';
    if (submitToOption === 'division') {
      designation = 'Executive Engineer';
    } else if (submitToOption === 'subdivision') {
      designation = 'Assistant Engineer';
    } else if (submitToOption === 'section') {
      designation = 'Section Officer';
    }

    // Get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB');
    const formattedTime = currentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    // Generate indent number (this would typically come from backend)
    const indentNumber = `VTPL/DMS/GESCOM/${currentDate.getFullYear()}-${(currentDate.getFullYear() + 1).toString().slice(2)}`;

    const indent = {
      division: selectedDivision ? selectedDivision.division : '',
      divisionCode: division,
      subDivision: selectedSubDivision ? selectedSubDivision.sub_division : '',
      subDivisionCode: subDivision,
      section: selectedSection ? selectedSection.section_office : '',
      sectionCode: section,
      submitTo: submitToOption,
      selectedOptions: availableOptions
        .filter(opt => selectedOptions.includes(opt.so_code || opt.sd_code))
        .map(opt => ({
          name: opt.sub_division || opt.section_office,
          code: opt.sd_code || opt.so_code
        })),
      selectedOptionNames,
      designation,
      date: formattedDate,
      time: formattedTime,
      indentNumber
    };

    setIndentData(indent);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('indent-content-inner');
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Indent</title>
          <style>
            /* Ensure the background image prints */
            body {
              margin: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .letterhead-container {
              width: 210mm;
              height: 297mm;
              margin: 0 auto;
              background-image: url(${letterheadImg});
              background-size: 100% 100%;
              background-repeat: no-repeat;
              position: relative;
            }
            .content-wrapper {
              padding: 140px 80px 50px 80px; /* Adjust padding to fit your letterhead */
              font-family: Arial, sans-serif;
              line-height: 1.5;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .indent-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .to-section { margin-bottom: 20px; }
            .subject { font-weight: bold; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            table, th, td { border: 1px solid black; }
            th, td { padding: 8px; text-align: left; }
            .footer { margin-top: 40px; font-size: 16px; }
            .signature { margin-top: 60px; font-size: 16px; }
          </style>
        </head>
        <body onload="window.print(); window.onafterprint = function() { window.close(); }">
          <div class="letterhead-container">
            <div class="content-wrapper">
              ${printContent.innerHTML}
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };


  const renderIndent = () => {
    if (!indentData) return null;

    return (
      // This outer div will hold the letterhead background for on-screen preview
      <div id="indent-content"
        className="a4-sheet"
        style={{
          backgroundImage: `url(${letterheadImg})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
        }}>
        {/* This inner div contains the actual report content and is padded to fit the letterhead */}
        <div id="indent-content-inner" style={{ paddingTop: '140px', paddingLeft: '80px', paddingRight: '80px' }}>
          {/* The header "INDENT" is removed as it's likely part of the letterhead image now */}

          <div className="indent-info">
            <div>
              <strong>Indent No.:</strong> {indentData.indentNumber}
            </div>
            <div style={{ textAlign: 'right' }}>
                <div><strong>Date:</strong> {indentData.date}</div>
                <div><strong>Time:</strong> {indentData.time}</div>
            </div>
          </div>

          <div className="to-section">
            <p>To,</p>
            <p>The {indentData.submitTo.charAt(0).toUpperCase() + indentData.submitTo.slice(1)} Officer</p>
            <p>{indentData.submitTo === 'division' ? indentData.divisionCode :
              indentData.submitTo === 'subdivision' ? indentData.subDivisionCode :
                indentData.sectionCode}</p>
          </div>

          <div className="subject">
            <p>Subject: Request for physical records of Gescom Consumer of {indentData.selectedOptionNames}</p>
            <p>DWA No: 14,42,53,250</p>
          </div>

          <div>
            <p>Dear Sir/Madam,</p>
            <p>with reference to the above DWA no and subject , we request for the pfysical available consumer records of below listed location </p>
          </div>

          <table>
            <thead>
              <tr>
                <th>SL NO</th>
                <th>Division</th>
                <th>Sub-Division</th>
                <th>Section</th>
              </tr>
            </thead>
            <tbody>
              {indentData.selectedOptions.map((option, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{indentData.division}</td>
                  <td>{indentData.subDivision}</td>
                  <td>{option.name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <p>Kindly process and arrange for handover of physical consumer records of above mentioned location</p>
          </div>

          <div className="signature">
            <p>Thanking you,</p>
            <p>Yours faithfully,</p>
            <p>_________________________</p>
            <p>Disclaimer * seal is not mandatory</p>
            <p>(This is computer/system generated copy)</p>

          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="page-content">
      <Container fluid>
        {!indentData ? (
          <Card className="mb-4">
            <CardHeader className="bg-primary text-white p-3">
              <h4 className="mb-0 text-white" style={{ fontSize: '22px' }}>Create Indent</h4>
            </CardHeader>
            <CardBody>
              <Form>
                <Row className="g-4">
                  <Col md={4}>
                    <FormGroup className="mb-4">
                      <Label className="form-label">Division <span className="text-danger">*</span></Label>
                      <Input
                        type="select"
                        value={division}
                        onChange={handleDivisionChange}
                        disabled={loading}
                        className="custom-dropdown"
                      >
                        <option value="">Select Division</option>
                        {divisionName.map(div => (
                          <option key={div.div_code} value={div.div_code}>
                            {div.division}
                          </option>
                        ))}
                      </Input>
                      {loading && divisionName.length === 0 && <Spinner size="sm" className="mt-2" />}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup className="mb-4">
                      <Label className="form-label">Sub Division <span className="text-danger">*</span></Label>
                      <Input
                        type="select"
                        value={subDivision}
                        onChange={handleSubDivisionChange}
                        disabled={!division || loading}
                        className="custom-dropdown"
                      >
                        <option value="">Select Sub Division</option>
                        {subDivisions.map(subDiv => (
                          <option key={subDiv.sd_code} value={subDiv.sd_code}>
                            {subDiv.sub_division}
                          </option>
                        ))}
                      </Input>
                      {loading && division && subDivisions.length === 0 && <Spinner size="sm" className="mt-2" />}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup className="mb-4">
                      <Label className="form-label">Section <span className="text-danger">*</span></Label>
                      <Input
                        type="select"
                        value={section}
                        onChange={handleSectionChange}
                        disabled={!subDivision || loading}
                        className="custom-dropdown"
                      >
                        <option value="">Select Section</option>
                        {sectionOptions.map(sec => (
                          <option key={sec.so_code} value={sec.so_code}>
                            {sec.section_office}
                          </option>
                        ))}
                      </Input>
                      {loading && subDivision && sectionOptions.length === 0 && <Spinner size="sm" className="mt-2" />}
                    </FormGroup>
                  </Col>
                </Row>

                {section && (
                  <>
                    <Row className="g-4 mt-4">
                      <Col md={12}>
                        <FormGroup className="submit-to-container mb-4">
                          <Label className="submit-to-label">Indent submitting to -</Label>
                          <div className="d-flex flex-wrap submit-to-options mt-3">
                            <div className="form-check me-5 custom-radio">
                              <input
                                className="form-check-input"
                                type="radio"
                                id="submit-division"
                                name="submitTo"
                                value="division"
                                checked={submitToOption === 'division'}
                                onChange={handleSubmitToChange}
                              />
                              <label className="form-check-label custom-radio-label" htmlFor="submit-division">
                                Division
                              </label>
                            </div>
                            <div className="form-check me-5 custom-radio">
                              <input
                                className="form-check-input"
                                type="radio"
                                id="submit-subdivision"
                                name="submitTo"
                                value="subdivision"
                                checked={submitToOption === 'subdivision'}
                                onChange={handleSubmitToChange}
                              />
                              <label className="form-check-label custom-radio-label" htmlFor="submit-subdivision">
                                Sub Division
                              </label>
                            </div>
                            <div className="form-check custom-radio">
                              <input
                                className="form-check-input"
                                type="radio"
                                id="submit-section"
                                name="submitTo"
                                value="section"
                                checked={submitToOption === 'section'}
                                onChange={handleSubmitToChange}
                              />
                              <label className="form-check-label custom-radio-label" htmlFor="submit-section">
                                Section
                              </label>
                            </div>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>

                    {submitToOption && availableOptions.length > 0 && submitToOption !== 'section' && (
                      <Row className="g-4 mt-4">
                        <Col md={12}>
                          <FormGroup className="mb-4">
                            <Label className="form-label">
                              Select {submitToOption === 'division' ? 'Subdivisions' : 'Sections'}
                            </Label>
                            <div className="border p-4 mt-2">
                              <Row>
                                {availableOptions.map(option => (
                                  <Col md={6} key={option.so_code || option.sd_code}>
                                    <div className="form-check mb-3">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`option-${option.so_code || option.sd_code}`}
                                        checked={selectedOptions.includes(option.so_code || option.sd_code)}
                                        onChange={(e) => handleOptionSelection(e, option.so_code || option.sd_code)}
                                      />
                                      <label
                                        className="form-check-label option-label"
                                        htmlFor={`option-${option.so_code || option.sd_code}`}
                                      >
                                        {option.sub_division || option.section_office}
                                      </label>
                                    </div>
                                  </Col>
                                ))}
                              </Row>
                            </div>
                          </FormGroup>
                        </Col>
                      </Row>
                    )}

                    <Row className="g-4 mt-5">
                      <Col md={12} className="d-flex justify-content-between">
                        <Button color="secondary" onClick={handleRefresh} className="action-button">
                          Refresh
                        </Button>
                        <Button
                          color="primary"
                          onClick={handleSubmit}
                          disabled={submitToOption !== 'section' && selectedOptions.length === 0}
                          className="action-button"
                        >
                          Submit
                        </Button>
                      </Col>
                    </Row>
                  </>
                )}
              </Form>
            </CardBody>
          </Card>
        ) : (
          <>
            {renderIndent()}
            <div className="mt-4 text-center">
              <Button color="secondary" onClick={() => setIndentData(null)} className="me-3 action-button">
                Back to Form
              </Button>
              <Button color="primary" onClick={handlePrint} className="action-button">
                Print Indent
              </Button>
            </div>
          </>
        )}

        {/* Print styles */}
        <style>
          {`
            .form-label {
              font-size: 17px;
              font-weight: 600;
              margin-bottom: 10px;
              color: #495057;
            }
            
            .custom-dropdown {
              background-color: #f8f9fa;
              border: 2px solid #ced4da;
              border-radius: 8px;
              padding: 12px 16px;
              font-size: 17px;
              color: #495057;
              transition: all 0.3s;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              height: 50px;
            }
            
            .custom-dropdown:focus {
              border-color: #80bdff;
              outline: 0;
              box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
              background-color: #fff;
            }
            
            .custom-dropdown:hover {
              border-color: #adb5bd;
              background-color: #e9ecef;
            }
            
            .custom-dropdown:disabled {
              background-color: #e9ecef;
              opacity: 0.7;
              cursor: not-allowed;
            }
            
            .submit-to-container {
              background-color: #f8f9fa;
              border-radius: 10px;
              padding: 20px;
              border: 1px solid #e9ecef;
            }
            
            .submit-to-label {
              font-weight: 700;
              color: #495057;
              margin-bottom: 15px;
              font-size: 18px;
            }
            
            .submit-to-options {
              gap: 25px;
            }
            
            .custom-radio {
              margin-bottom: 0;
            }
            
            .custom-radio .form-check-input {
              width: 20px;
              height: 20px;
              margin-top: 0.2rem;
            }
            
            .custom-radio .form-check-input:checked {
              background-color: #0d6efd;
              border-color: #0d6efd;
            }
            
            .custom-radio-label {
              font-weight: 600;
              color: #495057;
              padding-left: 10px;
              cursor: pointer;
              transition: color 0.2s;
              font-size: 17px;
            }
            
            .custom-radio:hover .custom-radio-label {
              color: #0d6efd;
            }
            
            .option-label {
              font-size: 16px;
              padding-left: 8px;
            }
            
            .action-button {
              padding: 12px 24px;
              font-size: 17px;
              font-weight: 600;
              border-radius: 8px;
            }
            
            @media print {
              .no-print {
                display: none !important;
              }
              .page-content {
                padding: 0 !important;
              }
              .a4-sheet {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                padding: 20mm;
                box-shadow: none;
                border: 1px solid #000 !important;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              table, th, td {
                border: 1px solid black;
              }
              th, td {
                padding: 8px;
                text-align: left;
              }
            }
            @media screen {
              .a4-sheet {
                width: 210mm;
                min-height: 297mm;
                margin: 20px auto;
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                border: 1px solid #ddd;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              table, th, td {
                border: 1px solid black;
              }
              th, td {
                padding: 8px;
                text-align: left;
              }
            }
          `}
        </style>
      </Container>
    </div>
  );
};

export default CreateIndent;

