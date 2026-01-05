import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 'light' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 'medium' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ]
});

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 8, fontFamily: 'Roboto' },
  header: { flexDirection: 'row', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#006AF3', paddingBottom: 5 },
  logo: { width: 145, height: 35 },
  headerText: { color: '#006AF3', fontSize: 16, fontWeight: 'bold', marginLeft: 'auto' },
  infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  companyInfo: { width: '48%' },
  clientInfo: { width: '48%', backgroundColor: '#F0F8FF', padding: 5, borderRadius: 3 },
  title: { fontSize: 10, marginBottom: 3, color: '#006AF3', textTransform: 'uppercase', fontWeight: 'bold' },
  table: { marginTop: 5 , display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#006AF3', borderRadius: 3 },
  tableRow: { flexDirection: 'row', borderBottomColor: '#006AF3', borderBottomWidth: 1 },
  tableCol: { width: '16%', padding: 3 },
  tableCell: { fontSize: 9, textAlign: 'center' },
  tableHeader: { backgroundColor: '#006AF3', color: 'white', fontWeight: 'bold' },
  total: { marginTop: 5, fontSize: 12, fontWeight: 'bold', textAlign: 'right', color: '#006AF3' },
  footer: { position: 'absolute', bottom: 20, left: 20, right: 20, textAlign: 'center', color: '#666', fontSize: 7, borderTopWidth: 1, borderTopColor: '#006AF3', paddingTop: 5 },
  infoText: { fontWeight:'bold' , fontSize: 8, marginBottom: 5, lineHeight: 1.2 },
  discountedPrice: { color: 'red', textDecoration: 'line-through' },
  kedvezmeny : {fontWeight: 'bold', fontSize: 10 , color:'red', textAlign:'right'},
  reszosszeg: { marginTop: 5, fontSize: 10,  textAlign: 'right', color: '#006AF3' },
});

const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const QuotePDF = ({ clientName, clientId, clientAddress, clientPhone, clientEmail, quoteItems, total, discount, notes }) => {
  const originalTotal = quoteItems.reduce((sum, item) => sum + (item.totalPrice / (1 - item.discount / 100)), 0);
  const itemDiscountsTotal = quoteItems.reduce((sum, item) => sum + (item.totalPrice / (1 - item.discount / 100) * item.discount / 100), 0);
  const subtotal = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const finalDiscountAmount = subtotal * discount / 100;
  const finalTotal = subtotal - finalDiscountAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src="/logo.png" />
          <Text style={styles.headerText}>ÁRAJÁNLAT</Text>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.companyInfo}>
            <Text style={styles.title}>RedLux Redőny Kft.</Text>
            <Text>Cím: 1119. Budapest, Andor utca 21/C. fszt. 1</Text>
            <Text>Tel: +36 30 606 6556</Text>
            <Text>E-mail: info@redlux.hu</Text>
            <Text>Adószám: 32704260-2-43</Text>
            <Text>www.redlux.hu</Text>
          </View>
          
          <View style={styles.clientInfo}>
            <Text style={styles.title}>Ügyfél adatai</Text>
            <Text>Név: {clientName || ''}</Text>
            <Text>Ügyfél azonosító: {clientId || ''}</Text>
            <Text>Cím: {clientAddress || ''}</Text>
            <Text>Telefon: {clientPhone || ''}</Text>
            <Text>E-mail: {clientEmail || ''}</Text>
          </View>
        </View>
        
        <Text style={styles.infoText}>
          Ajánlat készítés dátuma: {new Date().toLocaleDateString('hu-HU')}
          {'\n'}Érvényességi idő: {new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('hu-HU')}
          {'\n'}
          {'\n'}- 1,3 m² alatti termék esetén a termék ára egységáras.
          {'\n'}- A kalkuláció készítése során, a méretek egy tizedes jegyig felfelé kerülnek kerekítésre.
          {'\n'}
          {'\n'}- A jelenlegi gazdasági helyzetre való tekintettel árainkat 1 hétig tudjuk garantálni.
          {'\n'}- Az ajánlat elfogadásával 50 000 Ft feletti megrendelés esetén, előleg fizetési kötelezettséget vállal, mely a teljes összeg 50%-a.
          {'\n'}- Megrendelése az előlegszámla kiegyenlítését követően válik véglegessé.
          {'\n'}- A végösszeg tartalmazza a kiszállás és a munkadíj költségét is.
          {'\n'}- Az árak tartalmazzák az ÁFA-t.
          {'\n'}- Várható gyártási idő: 4-6 hét
          {'\n'}- Garancia: Redőnyre, szúnyoghálóra: 1 év, Motorra: 5 év
        </Text>
        
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>Termék</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Méret</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Szín</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>Menny.</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Egységár</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Összesen</Text></View>
          </View>
          {quoteItems.map((item, index) => {
            const originalUnitPrice = item.totalPrice / (item.quantity * (1 - item.discount / 100));
            const discountedUnitPrice = item.totalPrice / item.quantity;
            return (
              <View style={styles.tableRow} key={index}>
                <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{item.product || ''}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{item.dimensions || ''}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{item.color || ''}</Text></View>
                <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{item.quantity || ''}</Text></View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.discount > 0 && <Text style={styles.discountedPrice}>{formatNumber(originalUnitPrice.toFixed(0))} Ft{'\n'}</Text>}
                    {formatNumber(discountedUnitPrice.toFixed(0))} Ft
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.discount > 0 && <Text style={styles.discountedPrice}>{formatNumber((originalUnitPrice * item.quantity).toFixed(0))} Ft{'\n'}</Text>}
                    {formatNumber(item.totalPrice.toFixed(0))} Ft
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        
        <Text style={styles.reszosszeg}>Részösszeg: {formatNumber(originalTotal.toFixed(0))} Ft</Text>
        {itemDiscountsTotal > 0 && <Text style={styles.kedvezmeny}>Tételek kedvezménye: {formatNumber(itemDiscountsTotal.toFixed(0))} Ft</Text>}
        {discount > 0 && <Text style={styles.kedvezmeny}>További kedvezmény ({discount}%): {formatNumber(finalDiscountAmount.toFixed(0))} Ft</Text>}
        <Text style={styles.total}>Végösszeg: {formatNumber(finalTotal.toFixed(0))} Ft</Text>
        
        {notes && <Text style={styles.infoText}>Megjegyzések: {notes}</Text>}
        
        <Text style={styles.footer}>
          Köszönjük, hogy minket választott! Az árajánlat elfogadását az e-mailben található gombra kattintva tudja jelezni felénk.
        </Text>
      </Page>
    </Document>
  );
};

export default QuotePDF;