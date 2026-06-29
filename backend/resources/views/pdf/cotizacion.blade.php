<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Cotización - {{ $quotation->quotation_number }}</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            padding: 10px;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .header-left {
            width: 50%;
            vertical-align: top;
            text-align: left;
        }
        .header-right {
            width: 50%;
            vertical-align: top;
            text-align: right;
        }
        .company-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .company-address {
            font-size: 9px;
            margin-bottom: 10px;
        }
        .info-block {
            margin-top: 5px;
            font-size: 10px;
        }
        .info-row {
            margin-bottom: 2px;
        }
        .info-label {
            display: inline-block;
            width: 120px;
            font-weight: bold;
        }
        .doc-title-block {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
            display: inline-block;
            min-width: 250px;
            margin-bottom: 10px;
        }
        .doc-title-main {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .doc-title-sub {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .doc-title-name {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 15px;
            font-size: 10px;
        }
        .details-table th {
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            font-weight: bold;
            padding: 4px;
            text-align: left;
        }
        .details-table td {
            border-bottom: 1px dashed #ccc;
            padding: 5px 4px;
            vertical-align: top;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .summary-section {
            width: 100%;
            margin-top: 10px;
        }
        .summary-left {
            width: 60%;
            float: left;
            font-size: 10px;
        }
        .summary-right {
            width: 35%;
            float: right;
            text-align: right;
            font-size: 10px;
        }
        .summary-right-table {
            width: 100%;
            border-collapse: collapse;
        }
        .summary-right-table td {
            padding: 3px 0;
        }
        .summary-label {
            font-weight: bold;
            text-align: right;
            padding-right: 15px;
        }
        .summary-val {
            font-weight: bold;
            text-align: right;
            width: 100px;
        }
        .literal-box {
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        .note-box {
            font-weight: bold;
            margin-top: 15px;
            font-size: 9px;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
    </style>
</head>
<body>

@php
if (!function_exists('num2letras')) {
    function num2letras($num) {
        $matuni[2]  = "dos";      $matuni[3]  = "tres";    $matuni[4]  = "cuatro";
        $matuni[5]  = "cinco";    $matuni[6]  = "seis";    $matuni[7]  = "siete";
        $matuni[8]  = "ocho";     $matuni[9]  = "nueve";   $matuni[10] = "diez";
        $matuni[11] = "once";     $matuni[12] = "doce";    $matuni[13] = "trece";
        $matuni[14] = "catorce";  $matuni[15] = "quince";  $matuni[16] = "dieciseis";
        $matuni[17] = "diecisiete";$matuni[18] = "dieciocho";$matuni[19] = "diecinueve";
        $matuni[20] = "veinte";   $matuni[21] = "veintiuno";$matuni[22] = "veintidos";
        $matuni[23] = "veintitres";$matuni[24] = "veinticuatro";$matuni[25] = "veinticinco";
        $matuni[26] = "veintiseis";$matuni[27] = "veintisiete";$matuni[28] = "veintiocho";
        $matuni[29] = "veintinueve";
        
        $matdec[2] = "veinte";    $matdec[3] = "treinta";  $matdec[4] = "cuarenta";
        $matdec[5] = "cincuenta"; $matdec[6] = "sesenta";  $matdec[7] = "setenta";
        $matdec[8] = "ochenta";   $matdec[9] = "noventa";
        
        $matcen[1] = "ciento";    $matcen[2] = "doscientos";$matcen[3] = "trescientos";
        $matcen[4] = "cuatrocientos";$matcen[5] = "quinientos";$matcen[6] = "seiscientos";
        $matcen[7] = "setecientos";$matcen[8] = "ochocientos";$matcen[9] = "novecientos";
        
        $num = trim($num);
        if ($num == '') return '';
        if ($num == '0') return 'cero';
        
        $num = number_format($num, 2, '.', '');
        $parts = explode('.', $num);
        $entero = $parts[0];
        $dec_part = $parts[1];
        
        $res = '';
        $len = strlen($entero);
        $entero = str_pad($entero, 15, '0', STR_PAD_LEFT);
        
        $sub = array();
        for ($i = 0; $i < 5; $i++) {
            $sub[$i] = substr($entero, $i * 3, 3);
        }
        
        for ($i = 0; $i < 5; $i++) {
            $chunk = $sub[$i];
            if ($chunk == '000') continue;
            
            $c = intval($chunk[0]);
            $d = intval(substr($chunk, 1, 2));
            
            $text = '';
            if ($c > 0) {
                if ($c == 1 && $d == 0) {
                    $text .= 'cien ';
                } else {
                    $text .= $matcen[$c] . ' ';
                }
            }
            
            if ($d > 0) {
                if ($d < 30) {
                    if ($d == 1 && ($i == 1 || $i == 3 || $i == 4)) {
                        $text .= ($i == 4 ? 'un ' : '');
                    } else {
                        $text .= $matuni[$d] . ' ';
                    }
                } else {
                    $u = $d % 10;
                    $dec_tens = intval($d / 10);
                    $text .= $matdec[$dec_tens];
                    if ($u > 0) {
                        $text .= ' y ';
                        if ($u == 1 && ($i == 1 || $i == 3 || $i == 4)) {
                            $text .= 'un ';
                        } else {
                            $text .= $matuni[$u] . ' ';
                        }
                    } else {
                        $text .= ' ';
                    }
                }
            }
            
            if ($i == 0) $text .= 'mil millones ';
            if ($i == 1) $text .= 'millones ';
            if ($i == 2) $text .= 'mil ';
            if ($i == 3) $text .= 'millones ';
            if ($i == 4) {} // units
            
            $res .= $text;
        }
        
        $res = str_replace('millones mil', 'millones', $res);
        $res = str_replace('un millones', 'un millón', $res);
        
        $res = trim($res);
        return strtoupper($res) . ' ' . $dec_part . '/100 BOLIVIANOS';
    }
}
@endphp

<div class="container">
    <!-- Top Header Layout -->
    <table class="header-table">
        <tr>
            <td class="header-left">
                <div class="company-name">FABRICA DE CALAMINAS</div>
                <div class="company-address">
                    Av. Doble Via la Guardia Km 8<br>
                    ½ a lado del restaurant "Los Patos"<br>
                    77300567-69010531
                </div>
                
                <div class="info-block">
                    <div class="info-row"><span class="info-label">Punto de Venta:</span>DOBLE VIA</div>
                    <div class="info-row">
                        <span class="info-label">Cliente:</span>
                        {{ $quotation->client ? $quotation->client->nit_ci : 'S/NIT' }} {{ $quotation->client_name_snapshot }}
                    </div>
                    <div class="info-row"><span class="info-label">Contacto:</span>{{ $quotation->client ? $quotation->client->phone : '' }}</div>
                    <div class="info-row"><span class="info-label">Plazo Entrega:</span></div>
                    <div class="info-row"><span class="info-label">Observaciones:</span>{{ $quotation->observations ?: '' }}</div>
                </div>
            </td>
            <td class="header-right">
                <div class="doc-title-block">
                    <div class="doc-title-main">DOCUMENTO SIN VALOR FISCAL</div>
                    <div class="doc-title-sub">** Exija su factura **</div>
                    <div class="doc-title-name">COTIZACIÓN</div>
                </div>
                
                <div class="info-block" style="margin-top: 10px;">
                    <div class="info-row"><span class="info-label">Nro:</span>{{ $quotation->quotation_number }}</div>
                    <div class="info-row"><span class="info-label">Fecha:</span>{{ \Carbon\Carbon::parse($quotation->date)->format('d/m/Y') }}</div>
                    <div class="info-row"><span class="info-label">Vendedor:</span>{{ $quotation->seller ? $quotation->seller->name : 'MAMANI GABRIEL' }}</div>
                    <div class="info-row"><span class="info-label">Tipo:</span>OCASIONALES</div>
                    <div class="info-row"><span class="info-label">Teléfono:</span></div>
                    <div class="info-row"><span class="info-label">Moneda:</span>Bolivianos</div>
                    <div class="info-row"><span class="info-label">Anticipo:</span>0.00</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Details Table -->
    <table class="details-table">
        <thead>
            <tr>
                <th style="width: 3%; text-align: center;">N°</th>
                <th style="width: 15%;">Producto</th>
                <th style="width: 30%;">Descripción</th>
                <th style="width: 15%;">Lote</th>
                <th style="width: 13%;">Modelo</th>
                <th style="width: 6%; text-align: right;">Und.</th>
                <th style="width: 6%; text-align: right;">Largo</th>
                <th style="width: 6%; text-align: right;">Cant.</th>
                <th style="width: 6%; text-align: right;">Precio</th>
                <th style="width: 10%; text-align: right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @php $totalMeters = 0; @endphp
            @foreach($quotation->details as $index => $detail)
                @php
                    $meters = $detail->length * $detail->quantity;
                    $totalMeters += $meters;
                    
                    // Mock attributes since they are not fully relational in this table
                    $lote = 'IMP.56/24 B:4';
                    $modelo = 'Trapezoidal';
                    
                    if (str_contains(strtolower($detail->product->name), 'shingle')) {
                        $modelo = 'Trapezoidal Comercial';
                    }
                    if (str_contains(strtolower($detail->product->name), 'perno')) {
                        $lote = '';
                        $modelo = '';
                    }
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td style="font-family: monospace;">{{ $detail->product->code }}</td>
                    <td>
                        {{ $detail->product->name }}, {{ $detail->product->thickness }} mm
                    </td>
                    <td>{{ $lote }}</td>
                    <td>{{ $modelo }}</td>
                    <td class="text-right">{{ number_format($detail->quantity, 2) }}</td>
                    <td class="text-right">{{ number_format($detail->length, 2) }}</td>
                    <td class="text-right">{{ number_format($meters, 2) }}</td>
                    <td class="text-right">{{ number_format($detail->unit_price, 2) }}</td>
                    <td class="text-right">{{ number_format($detail->subtotal, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Footer Literal & Total Sections -->
    <div class="summary-section clearfix">
        <div class="summary-left">
            <div class="literal-box">
                Son: {{ num2letras($quotation->total) }}
            </div>
            
            <div class="note-box">
                NOTA: NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES.
            </div>
        </div>
        
        <div class="summary-right">
            <table class="summary-right-table">
                <tr>
                    <td class="summary-label">Total Metros:</td>
                    <td class="summary-val">{{ number_format($totalMeters, 2) }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Total:</td>
                    <td class="summary-val">{{ number_format($quotation->total, 2) }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Saldo por Pagar:</td>
                    <td class="summary-val">{{ number_format($quotation->total, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>
</div>

</body>
</html>
