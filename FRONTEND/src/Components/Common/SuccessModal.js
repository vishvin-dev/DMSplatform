import PropTypes from "prop-types";
import React from "react";
import { Modal, ModalBody } from "reactstrap";

const SuccessModal = ({ show, onCloseClick, successMsg }) => {
  return (
    <Modal fade={true} isOpen={show} toggle={onCloseClick} centered={true}>
      <ModalBody className="py-3 px-5">
        <div className="mt-2 text-center">
        <lord-icon
            src="https://cdn.lordicon.com/lupuorrc.json"
            trigger="loop"
            colors="primary:#0ab39c,secondary:#405189"
            style={{ width: "120px", height: "120px" }}
          ></lord-icon>
          
          <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
            <h4>Great Job!</h4>
            <p className="text-muted mx-4 mb-0">
            <h5>{successMsg}</h5> 
            </p>
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
          <button
            type="button"
            className="btn w-sm btn-primary material-shadow-none"
            data-bs-dismiss="modal"
            onClick={onCloseClick}
          >
            Ok
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
};

SuccessModal.propTypes = {
  onCloseClick: PropTypes.func,
  successMsg: PropTypes.any,
  show: PropTypes.any,
};

export default SuccessModal;