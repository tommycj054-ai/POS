// Adds individual barcode generation to every size-variant row.
(function () {
  function addGenerateButton(row) {
    if (!row || row.querySelector('.generate-variant-barcode')) return;
    const barcodeInput = row.querySelector('.variant-barcode');
    if (!barcodeInput) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'generate-variant-barcode';
    button.textContent = 'Generate Barcode';
    button.addEventListener('click', function () {
      if (typeof generateBarcodeNumber === 'function') {
        barcodeInput.value = generateBarcodeNumber();
      }
    });

    barcodeInput.insertAdjacentElement('afterend', button);
  }

  function addButtonsToExistingRows() {
    document.querySelectorAll('.variant-row').forEach(addGenerateButton);
  }

  const originalAddVariantRow = window.addVariantRow;
  window.addVariantRow = function (prefix, variant) {
    if (typeof originalAddVariantRow === 'function') {
      originalAddVariantRow(prefix, variant);
    }
    const container = document.getElementById(prefix + 'Variants');
    const row = container?.lastElementChild;
    addGenerateButton(row);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addButtonsToExistingRows);
  } else {
    addButtonsToExistingRows();
  }
})();
