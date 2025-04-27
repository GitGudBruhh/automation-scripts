(function() {
  const embeddedDocument = document.querySelector('object').contentDocument
  const tableWidgets = embeddedDocument.querySelectorAll('.table-widget');

  const studentName = embeddedDocument.querySelector('.h_primary').innerText
  const studentRoll = embeddedDocument.querySelector('.h_01').innerText
  const [studentBranch, studentBatch, studentSemester, _dummy] = Array.from(embeddedDocument.querySelectorAll('.h_secondary')).map(el => el.innerText);
  const currentCPI = embeddedDocument.querySelector('.CGPA_Val').innerHTML
  const spiTableWidget = tableWidgets[15];
  const courseTableWidget = tableWidgets[16];

  const openBothTablePopup = async (spiTableWidget, courseTableWidget) => {
    const spiTable = spiTableWidget.querySelector('.table-widget-content .rounded .dataTables_wrapper .dataTable');
    const courseTable = courseTableWidget.querySelector('.table-widget-content .rounded .dataTables_wrapper .dataTable');

    if (spiTable && courseTable) {
      const serializer = new XMLSerializer();
      const spiTableHTML = serializer.serializeToString(spiTable);
      const courseTableHTML = serializer.serializeToString(courseTable);

      const popup = window.open('', 'PopupWindow', 'width=800,height=600,scrollbars=yes,resizable=yes');
      if (popup) {
        popup.document.open();
        popup.document.write(`
          <html>
            <head>
              <title>Student Summary</title>
              <meta charset="utf-8">
              <style>
                body { padding: 20px; font-family: Arial, sans-serif; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ccc; padding: 8px; }
                th { background-color: #f7f7f7; }
              </style>
            </head>
            <body>
              <h2>Student Details</h2>
              <ul>
                <li><strong>Name:</strong> ${studentName}</li>
                <li><strong>Roll Number:</strong> ${studentRoll}</li>
                <li><strong>Branch:</strong> ${studentBranch}</li>
                <li><strong>Batch:</strong> ${studentBatch}</li>
                <li><strong>Semester:</strong> ${studentSemester}</li>
                <li><strong>CPI:</strong> ${currentCPI}</li>
              </ul>


              <h2>Academic Performance Summary</h2>
              ${spiTableHTML}

              <h2>Course Summary</h2>
              ${courseTableHTML}
            </body>
          </html>
        `);
        popup.document.close();
        popup.focus();
      } else {
        alert('Popup blocked!');
      }
    } else {
      alert('Tables not found!');
    }
  };

  openBothTablePopup(spiTableWidget, courseTableWidget);

})();
