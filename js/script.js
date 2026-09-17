function log(msg) {
  console.log(msg);
  const el = document.getElementById('log');
  if (el) el.textContent += msg + '\n';
}

cv['onRuntimeInitialized'] = function () {
  const inputImagem = document.querySelector('#inputImagem');
  const btnContraste = document.querySelector('#btnContraste');
  const statusEl = document.querySelector('#status');
  let src;

  statusEl.textContent = 'OpenCV.js carregado. Selecione uma imagem.';

  inputImagem.addEventListener('change', function (e) {
    if (!e.target.files[0]) return;
    const img = document.createElement('img');
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = () => {
      if (src) src.delete();
      src = cv.imread(img);
      cv.imshow('canvasOriginal', src);
      btnContraste.disabled = false;
      statusEl.textContent = 'Imagem carregada. Clique em "Gerar efeito retrato".';
    };
  });

  btnContraste.addEventListener('click', function () {
    if (!src) return;

    const centro = new cv.Point(Math.round(src.cols / 2), Math.round(src.rows / 2));
    const raioMenor = Math.round(Math.min(src.cols, src.rows) * 0.16);
    const raioMaior = Math.round(Math.min(src.cols, src.rows) * 0.36);

    // As duas bases desfocadas usadas pelo efeito.
    const gauss = new cv.Mat();
    const media = new cv.Mat();
    cv.GaussianBlur(src, gauss, new cv.Size(21, 21), 0);
    cv.blur(src, media, new cv.Size(15, 15));

    const mascaraMenor = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
    const mascaraMaior = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
    cv.circle(mascaraMenor, centro, raioMenor, new cv.Scalar(255), -1);
    cv.circle(mascaraMaior, centro, raioMaior, new cv.Scalar(255), -1);

    // Recortes circulares: primeiro a região nítida, depois a região gaussiana.
    const recorteOriginal = new cv.Mat();
    const recorteGauss = new cv.Mat();
    src.copyTo(recorteOriginal, mascaraMenor);
    gauss.copyTo(recorteGauss, mascaraMaior);

    // Sobreposição progressiva das regiões mascaradas.
    const fundoFocado = media.clone();
    recorteGauss.copyTo(fundoFocado, mascaraMaior);
    const retrato = fundoFocado.clone();
    recorteOriginal.copyTo(retrato, mascaraMenor);

    cv.imshow('canvasGlaussianBlur', gauss);
    cv.imshow('canvasSaida', media);
    cv.imshow('canvasMascaraMenor', recorteOriginal);
    cv.imshow('canvasMascaraMaior', recorteGauss);
    cv.imshow('canvasFundoFocado', fundoFocado);
    cv.imshow('canvasRetrato', retrato);

    gauss.delete();
    media.delete();
    mascaraMenor.delete();
    mascaraMaior.delete();
    recorteOriginal.delete();
    recorteGauss.delete();
    fundoFocado.delete();
    retrato.delete();

    statusEl.textContent = 'Efeito retrato concluído: centro nítido e fundo desfocado.';
  });
};
