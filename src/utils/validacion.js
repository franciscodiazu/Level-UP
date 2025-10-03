function validarRun(run) {
    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(run)) return false;
    var tmp = run.split('-');
    var digv = tmp[1];
    var rut = tmp[0];
    if (digv == 'K') digv = 'k';
    var M = 0, S = 1;
    for (; rut; rut = Math.floor(rut / 10))
        S = (S + rut % 10 * (9 - M++ % 6)) % 11;
    return S ? S - 1 == digv : 'k' == digv;
}