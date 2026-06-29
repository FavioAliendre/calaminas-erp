<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nota de Venta - {{ $sale->sale_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .logo-section {
            width: 50%;
            vertical-align: top;
        }
        .logo-placeholder {
            font-size: 24px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 5px;
        }
        .company-details {
            color: #666;
            font-size: 10px;
        }
        .invoice-section {
            width: 50%;
            text-align: right;
            vertical-align: top;
        }
        .invoice-box {
            display: inline-block;
            border: 1px solid #1e3a8a;
            border-radius: 4px;
            padding: 15px;
            background-color: #f8fafc;
            text-align: center;
            min-width: 200px;
        }
        .invoice-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .invoice-number {
            font-size: 14px;
            font-weight: bold;
            color: #dc2626;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background-color: #fdfdfd;
            border: 1px solid #e2e8f0;
        }
        .info-table td {
            padding: 8px 10px;
            vertical-align: top;
            border-bottom: 1px solid #f1f5f9;
        }
        .info-label {
            font-weight: bold;
            color: #475569;
            width: 15%;
        }
        .info-val {
            color: #0f172a;
            width: 35%;
        }
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .products-table th {
            background-color: #1e3a8a;
            color: white;
            font-weight: bold;
            text-align: left;
            padding: 8px;
            font-size: 10px;
            text-transform: uppercase;
            border: 1px solid #1e3a8a;
        }
        .products-table td {
            padding: 8px;
            border: 1px solid #e2e8f0;
        }
        .products-table tr:nth-child(even) td {
            background-color: #f8fafc;
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
        .summary-table {
            width: 35%;
            float: right;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
        }
        .summary-label {
            font-weight: bold;
            color: #475569;
            background-color: #f8fafc;
        }
        .summary-value {
            font-weight: bold;
            text-align: right;
            font-size: 12px;
        }
        .total-row {
            background-color: #f1f5f9;
            color: #0f172a;
        }
        .balance-row {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .observations-box {
            width: 60%;
            float: left;
            border: 1px solid #e2e8f0;
            padding: 10px;
            border-radius: 4px;
            min-height: 60px;
            background-color: #fafafa;
        }
        .observations-title {
            font-weight: bold;
            color: #475569;
            margin-bottom: 5px;
            font-size: 9px;
            text-transform: uppercase;
        }
        .footer {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
    </style>
</head>
<body>

    <!-- Header Table -->
    <table class="header-table">
        <tr>
            <td class="logo-section">
                <div class="logo-placeholder">CALAMINAS S.A.</div>
                <div class="company-details">
                    Comercializadora de Calaminas y Aceros<br>
                    NIT: 1029384756<br>
                    Av. Panamericana Nro. 123, Cochabamba, Bolivia<br>
                    Teléfono: 4-4556677 | Celular: 71234567<br>
                    Email: contacto@calaminas.com
                </div>
            </td>
            <td class="invoice-section">
                <div class="invoice-box">
                    <div class="invoice-title">Nota de Venta</div>
                    <div class="invoice-number">{{ $sale->sale_number }}</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Info Table -->
    <table class="info-table">
        <tr>
            <td class="info-label">Fecha:</td>
            <td class="info-val">{{ $sale->date->format('d/m/Y') }}</td>
            <td class="info-label">Vendedor:</td>
            <td class="info-val">{{ $sale->seller->name }}</td>
        </tr>
        <tr>
            <td class="info-label">Cliente:</td>
            <td class="info-val">{{ $sale->client_name_snapshot }}</td>
            <td class="info-label">NIT/CI:</td>
            <td class="info-val">{{ $sale->client ? $sale->client->nit_ci : 'N/A' }}</td>
        </tr>
        <tr>
            <td class="info-label">Dirección:</td>
            <td class="info-val" colspan="3">{{ $sale->client ? $sale->client->address : 'S/D' }}</td>
        </tr>
    </table>

    <!-- Products Table -->
    <table class="products-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 45%;">Producto</th>
                <th class="text-center" style="width: 12%;">Largo (M)</th>
                <th class="text-center" style="width: 12%;">Cantidad (Pzs)</th>
                <th class="text-right" style="width: 13%;">Precio/M</th>
                <th class="text-right" style="width: 13%;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->details as $index => $detail)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $detail->product->name }}</strong><br>
                        <span style="font-size: 9px; color: #666;">Código: {{ $detail->product->code }} | Color: {{ $detail->product->color }} | Espesor: {{ $detail->product->thickness }}mm</span>
                    </td>
                    <td class="text-center">{{ number_format($detail->length, 2) }}</td>
                    <td class="text-center">{{ number_format($detail->quantity, 0) }}</td>
                    <td class="text-right">Bs. {{ number_format($detail->unit_price, 2) }}</td>
                    <td class="text-right">Bs. {{ number_format($detail->subtotal, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Summary Section -->
    <div class="summary-section clearfix">
        <div class="observations-box">
            <div class="observations-title">Observaciones:</div>
            <div>{{ $sale->observations ?: 'Sin observaciones.' }}</div>
        </div>

        <table class="summary-table">
            <tr class="total-row">
                <td class="summary-label">TOTAL:</td>
                <td class="summary-value">Bs. {{ number_format($sale->total, 2) }}</td>
            </tr>
            <tr>
                <td class="summary-label">ANTICIPO:</td>
                <td class="summary-value">Bs. {{ number_format($sale->advance_payment, 2) }}</td>
            </tr>
            <tr class="balance-row">
                <td class="summary-label">SALDO:</td>
                <td class="summary-value">Bs. {{ number_format($sale->balance, 2) }}</td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer">
        Este documento es una Nota de Venta comercializada por Calaminas S.A.<br>
        ¡Gracias por su preferencia!
    </div>

</body>
</html>
