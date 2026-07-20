import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' },
  header: { marginBottom: 20, borderBottom: 2, borderColor: '#2563EB', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 8, color: '#64748B', marginTop: 2 },
  
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 6, borderBottom: 1, borderColor: '#E2E8F0' },
  headerCell: { fontSize: 8, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', flex: 1, paddingHorizontal: 2 },
  
  tableRow: { flexDirection: 'row', borderBottom: 1, borderColor: '#F1F5F9', padding: 6 },
  cell: { fontSize: 8, color: '#334155', flex: 1, paddingHorizontal: 2 },
});

export const MembersListPDF = ({ members }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Annuaire des Membres</Text>
        <Text style={styles.subtitle}>KARATIX - Exportation au {new Date().toLocaleDateString('fr-FR')}</Text>
      </View>
      
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, {flex: 0.8}]}>ID</Text>
        <Text style={[styles.headerCell, {flex: 1.2}]}>NOM / PRÉNOM</Text>
        <Text style={[styles.headerCell, {flex: 0.4}]}>SEXE</Text>
        <Text style={[styles.headerCell, {flex: 0.8}]}>CONTACT URG.</Text>
        <Text style={[styles.headerCell, {flex: 0.6}]}>NAISSANCE</Text>
        <Text style={[styles.headerCell, {flex: 0.6}]}>ENTRÉE</Text>
      </View>
      
      {members.map((member) => (
        <View key={member.id} style={styles.tableRow}>
          <Text style={[styles.cell, {flex: 0.8, fontFamily: 'Courier-Bold'}]}>{member.member_number}</Text>
          <Text style={[styles.cell, {flex: 1.2}]}>{member.last_name.toUpperCase()} {member.first_name}</Text>
          <Text style={[styles.cell, {flex: 0.4}]}>{member.gender}</Text>
          <Text style={[styles.cell, {flex: 0.8}]}>{member.emergency_phone || '-'}</Text>
          <Text style={[styles.cell, {flex: 0.6}]}>{new Date(member.birth_date).toLocaleDateString('fr-FR')}</Text>
          <Text style={[styles.cell, {flex: 0.6}]}>{new Date(member.entry_date).toLocaleDateString('fr-FR')}</Text>
        </View>
      ))}
    </Page>
  </Document>
);
