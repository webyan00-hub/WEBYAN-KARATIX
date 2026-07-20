import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#F8FAFC' },
  container: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, borderBottom: 2, borderColor: '#2563EB', paddingBottom: 20 },
  photo: { width: 80, height: 80, borderRadius: 40, marginRight: 20, border: '2px solid #E2E8F0' },
  headerText: { flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 4 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#F1F5F9', padding: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginLeft: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  item: { width: '50%', marginBottom: 12 },
  label: { fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 11, color: '#1E293B', fontWeight: 'bold' },
});

// Icône simple en SVG
const Icon = ({ d }) => (
  <Svg width="14" height="14" viewBox="0 0 24 24">
    <Path d={d} fill="#2563EB" />
  </Svg>
);

export const MemberPDF = ({ member }) => {
  const photoUrl = member.photo_url 
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-photos/${member.photo_url}` 
    : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.header}>
            {photoUrl && <Image style={styles.photo} src={photoUrl} />}
            <View style={styles.headerText}>
              <Text style={styles.title}>{member.last_name.toUpperCase()} {member.first_name}</Text>
              <Text style={styles.subtitle}>Fiche Membre | KARATIX</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>
            </View>
            <View style={styles.grid}>
              <View style={styles.item}><Text style={styles.label}>ID Membre</Text><Text style={styles.value}>{member.member_number}</Text></View>
              <View style={styles.item}><Text style={styles.label}>Grade</Text><Text style={styles.value}>{member.grade}</Text></View>
              <View style={styles.item}><Text style={styles.label}>Naissance</Text><Text style={styles.value}>{member.birth_date}</Text></View>
              <View style={styles.item}><Text style={styles.label}>Sexe</Text><Text style={styles.value}>{member.gender === 'M' ? 'Masculin' : 'Féminin'}</Text></View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              <Text style={styles.sectionTitle}>CONTACT</Text>
            </View>
            <View style={styles.grid}>
              <View style={styles.item}><Text style={styles.label}>Téléphone</Text><Text style={styles.value}>{member.phone}</Text></View>
              <View style={styles.item}><Text style={styles.label}>Email</Text><Text style={styles.value}>{member.email}</Text></View>
              <View style={{width: '100%'}}><Text style={styles.label}>Adresse</Text><Text style={styles.value}>{member.address}</Text></View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
