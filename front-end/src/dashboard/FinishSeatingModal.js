import React from "react";
import Modal from 'react-modal';

export default function FinishSeatingModal({modalIsOpen, afterOpenModal, closeModal, customStyles}) {
  return (
    <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >

          <h2>Finish Table</h2>
          <p>Is this table ready to seat new guests? This cannot be undone.</p>
          <button type="button" onClick={closeModal}>Cancel</button>
          <button type="button">Reset Table</button>
        </Modal>
  );
}