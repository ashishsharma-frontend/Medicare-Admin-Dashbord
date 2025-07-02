import api from "../../Controllers/api";

const printPrescription = (id) => {
  const pdfUrl = `${api}/prescription/generatePDF/${id}`;
  const newWindow = window.open(pdfUrl, "_blank");

  if (newWindow) {
    newWindow.focus();
    newWindow.onload = () => {
      newWindow.load();
      newWindow.onafterprint = () => {
        newWindow.close();
      };
    };
  }
};

export default printPrescription;
