/* POS checkout/inventory safety upgrades */
(function () {
    const originalDeleteProduct = window.deleteProduct;

    document.addEventListener('click', function (event) {
        const button = event.target.closest('button');
        if (!button) return;

        const action = button.getAttribute('onclick') || '';
        const match = action.match(/^deleteProduct\((\d+)\)$/);
        if (!match) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const id = Number(match[1]);
        const product = Array.isArray(window.products)
            ? window.products.find(p => Number(p.id) === id)
            : null;

        const name = product && product.name ? product.name : 'this product';
        if (confirm(`Delete "${name}" from inventory?`)) {
            if (typeof originalDeleteProduct === 'function') {
                originalDeleteProduct(id);
            }
        }
    }, true);
})();
