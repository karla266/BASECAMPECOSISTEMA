function precioMxn(producto) {
  if (Number.isInteger(producto.precio_cents)) {
    const centavos = Math.abs(producto.precio_cents);
    return `${Math.floor(centavos / 100)}.${String(centavos % 100).padStart(2, "0")}`;
  }
  const precio = Number(producto.precio);
  return Number.isFinite(precio) ? precio.toFixed(2) : "0.00";
}

function imagenProducto(producto) {
  const lista = producto.media?.images || producto.imagenes || [];
  const encontrada = lista.find((item) => typeof item === "string" && item.trim());
  if (!encontrada) return "";
  if (encontrada.startsWith("https://")) return encontrada;
  return `https://www.basecamp420.com${encontrada.startsWith("/") ? encontrada : `/${encontrada}`}`;
}

export default function SchemaProducto({ producto }) {
  const stock = Number(producto.stock ?? 0);
  const imagen = imagenProducto(producto);
  const datos = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    sku: producto.sku,
    category: producto.categoria || "The Trip Smoke Shop",
    brand: { "@type": "Brand", name: "The Trip Smoke Shop" },
    url: `https://www.basecamp420.com/tienda#${producto.sku}`,
    ...(imagen ? { image: imagen } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "MXN",
      price: precioMxn(producto),
      availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `https://www.basecamp420.com/tienda#${producto.sku}`,
      seller: {
        "@type": "Organization",
        name: "Basecamp 420",
        url: "https://www.basecamp420.com",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }}
    />
  );
}

export function SchemaListaProductos({ productos }) {
  return productos.map((producto) => <SchemaProducto key={producto.sku} producto={producto} />);
}
