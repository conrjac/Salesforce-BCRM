async function renderBCRM() {
  const filter = document.getElementById('search').value.toLowerCase();
  const res = await fetch('./data/bcrm.yaml');
  const yamlText = await res.text();
  const data = jsyaml.load(yamlText);

  let mermaidText = 'flowchart LR\n';
  mermaidText += '  classDef domain fill:#f9f,stroke:#333,stroke-width:2px;\n';

  data.domains.forEach(domain => {
    const showDomain = !filter || domain.name.toLowerCase().includes(filter);
    const showProduct = cap => cap.products?.some(p => p.toLowerCase().includes(filter));

    if (!showDomain && !domain.capabilities.some(showProduct)) return;

    mermaidText += `  ${domain.name}["${domain.name}"]:::domain\n`;

    domain.capabilities.forEach(cap => {
      if (!showProduct(cap) && !domain.name.toLowerCase().includes(filter)) return;

      const capId = cap.name.replace(/\s+/g, '');
      mermaidText += `  ${domain.name} --> ${capId}["${cap.name}"]\n`;

      cap.sub_capabilities?.forEach(sub => {
        const subId = sub.name.replace(/\s+/g, '');
        mermaidText += `  ${capId} --> ${subId}["${sub.name}"]\n`;
      });
    });
  });

  document.querySelector('.mermaid').textContent = mermaidText;
  mermaid.init(undefined, document.querySelectorAll(".mermaid"));
}

document.getElementById('search').addEventListener('input', renderBCRM);

window.exportToPDF = async function () {
  const canvas = await html2canvas(document.querySelector('.mermaid'));
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jspdf.jsPDF();
  pdf.addImage(imgData, 'PNG', 10, 10);
  pdf.save('bcrm.pdf');
}

window.exportToPNG = async function () {
  const canvas = await html2canvas(document.querySelector('.mermaid'));
  const link = document.createElement('a');
  link.download = 'bcrm.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

renderBCRM();
