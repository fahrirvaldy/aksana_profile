'use client';
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { L10Data } from "../types";

const s = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: '30pt 40pt',
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    section: {
        marginBottom: 15,
    },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 10, color: '#475569' },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#D1D5DB', paddingBottom: 4 },
    
    text: {
        fontSize: 10,
        color: '#334155',
        lineHeight: 1.5,
        wordBreak: 'break-all',
    },
    textBold: { 
        fontSize: 10, 
        fontWeight: 'bold', 
        color: '#1E293B',
        wordBreak: 'break-all',
    },
    smallText: {
        fontSize: 8, 
        color: '#64748b',
        wordBreak: 'break-all',
    },
    textArea: {
        fontSize: 9, 
        color: '#334155',
        lineHeight: 1.4,
        wordBreak: 'break-all', 
    },
    planText: {
        fontSize: 10,
        color: '#334155',
        lineHeight: 1.5,
        wordBreak: 'break-all',
        marginBottom: 2,
    },

    row: { flexDirection: 'row', width: '100%' },
    col: { padding: '4pt' },
    col_100: { width: '100%', padding: '4pt' },
    col_75: { width: '75%', padding: '4pt' },
    col_50: { width: '50%', padding: '4pt' },
    col_25: { width: '25%', padding: '4pt' },
    col_20: { width: '20%', padding: '4pt' },

    card: {
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: 5,
        padding: 12,
        marginBottom: 8,
        backgroundColor: '#F8FAFC'
    },
    badge: {
        fontSize: 8,
        fontWeight: 'bold',
        padding: '3pt 5pt',
        borderRadius: 4,
        textTransform: 'uppercase',
    },
    badgeOn: { backgroundColor: '#D1FAE5', color: '#065F46' },
    badgeOff: { backgroundColor: '#FEE2E2', color: '#991B1B' },
});




interface L10PDFDocumentProps {
    data: L10Data;
    averageRating: string | number;
}

const L10PDFDocument: React.FC<L10PDFDocumentProps> = ({ data, averageRating }) => (
    <Document author="Aksana Business Lab" title={`L10 Report - ${data.config.companyName}`}>
        
        <Page size="A4" style={s.page}>
            <View style={s.header}>
                <View>
                    <Text style={s.title}>L10 Meeting: Executive Summary</Text>
                    <Text style={s.subtitle}>{data.config.companyName} - {data.meetingDate}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{...s.title, color: '#2563EB'}}>{averageRating}</Text>
                    <Text style={s.smallText}>Avg. Rating</Text>
                </View>
            </View>

            <View style={s.section}> 
                <Text style={s.sectionTitle}>Headlines</Text>
                <View style={s.row}>
                    <View style={s.col_50}>
                        <Text style={s.textBold}>Customer:</Text>
                        {(data.headlines.customer || []).filter(h => h.trim()).map((h, i) => <Text key={i} style={s.text}>• {h}</Text>)}
                    </View>
                    <View style={s.col_50}>
                        <Text style={s.textBold}>Internal:</Text>
                        {(data.headlines.internal || []).filter(h => h.trim()).map((h, i) => <Text key={i} style={s.text}>• {h}</Text>)} 
                    </View>
                </View>
            </View>
            
            <View style={s.section} break>
                <Text style={s.sectionTitle}>To-Do List</Text>
                {data.todoList.map((todo) => (
                    <View key={todo.id} style={s.card}>
                        <View style={s.row}>
                            <View style={s.col_75}>
                                <Text style={{...s.text, textDecoration: todo.isDone ? 'line-through' : 'none'}}>{todo.text}</Text>
                            </View>
                            <View style={s.col_25}>
                                <Text style={s.smallText}>Owner: {todo.owner}</Text>
                                <Text style={s.smallText}>Deadline: {todo.deadline || 'N/A'}</Text>
                                <Text style={[s.badge, todo.isDone ? s.badgeOn : s.badgeOff]}>{todo.isDone ? "DONE" : "PENDING"}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </Page>
        
        <Page size="A4" style={s.page}>
            <Text style={s.sectionTitle}>Rock Review</Text>
            {data.config.rocks.map((rock, i) => (
                <View key={i} style={s.card}>
                    <Text style={s.textBold}>{rock}</Text>
                    <View style={s.row}>
                        <View style={s.col_50}>
                            <Text style={s.smallText}>PIC: {data.rocksStatus[i]?.pic || '-'}</Text>
                             <Text style={[s.badge, data.rocksStatus[i]?.status === 'on' ? s.badgeOn : s.badgeOff]}>
                                {data.rocksStatus[i]?.status === 'on' ? 'ON TRACK' : 'OFF TRACK'}
                            </Text>
                        </View>
                        <View style={s.col_50}>
                            <Text style={s.smallText}>Notes: {data.rocksStatus[i]?.notes || '-'}</Text>
                        </View>
                    </View>
                </View>
            ))}
        </Page>

        <Page size="A4" style={s.page}>
            <Text style={s.sectionTitle}>IDS - Issues List</Text>
             {data.idsSession.issues.map((issue) => (
                <View key={issue.id} style={s.card}>
                    <View style={s.row}>
                        <View style={s.col_75}>
                            <Text style={s.text}>{issue.text}</Text>
                            <Text style={s.smallText}>Source: {issue.source}</Text>
                        </View>
                        <View style={s.col_25}>
                             <Text style={s.smallText}>Votes: {issue.votes || 0}</Text>
                             <Text style={s.smallText}>Selected: {issue.isSelectedForDiscussion ? 'Yes' : 'No'}</Text>
                             <Text style={[s.badge, issue.isResolved ? s.badgeOn : s.badgeOff]}>{issue.isResolved ? "RESOLVED" : "OPEN"}</Text>
                        </View>
                    </View>
                </View>
            ))}
        </Page>

        {/* --- DYNAMIC PAGES: IDS Themes (Fishbone, 5W1H etc.) --- */}
        {(data.idsSession?.themes || []).map((theme, tIdx) => (
            <Page key={tIdx} size="A4" style={s.page}>
                <Text style={s.sectionTitle}>IDS Analysis: {theme.topic || `Tema #${tIdx + 1}`}</Text>

                <View style={s.card}>
                    <Text style={s.textBold}>Kondisi Sekarang:</Text>
                    <Text style={s.text}>{theme.currentCond}</Text>
                    <Text style={{...s.textBold, marginTop: 10}}>Kondisi Diinginkan:</Text>
                    <Text style={s.text}>{theme.desiredCond}</Text>
                </View>

                <Text style={{...s.sectionTitle, marginTop: 15}}>Fishbone (5M)</Text>
                <View style={s.card}>
                    <Text style={s.textBold}>Man:</Text><Text style={s.text}>{theme.analysis.man}</Text>
                    <Text style={{...s.textBold, marginTop: 8}}>Method:</Text><Text style={s.text}>{theme.analysis.method}</Text>
                    <Text style={{...s.textBold, marginTop: 8}}>Machine:</Text><Text style={s.text}>{theme.analysis.machine}</Text>
                    <Text style={{...s.textBold, marginTop: 8}}>Material:</Text><Text style={s.text}>{theme.analysis.material}</Text>
                    <Text style={{...s.textBold, marginTop: 8}}>Environment:</Text><Text style={s.text}>{theme.analysis.environment}</Text>
                </View>

                <View style={s.card} break>
                    <Text style={s.sectionTitle}>5-Why & Action Plan</Text>
                    <Text style={s.textBold}>Akar Masalah:</Text>
                    <Text style={s.text}>{theme.rootCause}</Text>

                    <Text style={{...s.textBold, marginTop: 15}}>Rencana Perbaikan (5W1H):</Text>
                    <Text style={s.planText}><Text style={{ fontWeight: 'bold' }}>What (Tindakan):</Text> {theme.plan.what || "-"}</Text>
                    <Text style={s.planText}><Text style={{ fontWeight: 'bold' }}>Who (PIC):</Text> {theme.plan.who || "-"}</Text>
                    <Text style={s.planText}><Text style={{ fontWeight: 'bold' }}>When (Tenggat):</Text> {theme.plan.when || "-"}</Text>
                    <Text style={s.planText}><Text style={{ fontWeight: 'bold' }}>Where (Lokasi):</Text> {theme.plan.where || "-"}</Text>
                    <Text style={s.planText}><Text style={{ fontWeight: 'bold' }}>Why (Urgensi):</Text> {theme.plan.why || "-"}</Text>
                    <Text style={{ ...s.planText, color: "#7e22ce", fontWeight: "bold", marginTop: 2 }}>Cost (Biaya): {theme.plan.cost || "-"}</Text>
                </View>
            </Page>
        ))}

        {/* --- FINAL SOLUTION PAGE --- */}
        {data.idsSession.solutions && (
            <Page size="A4" style={s.page} break>
                <Text style={s.sectionTitle}>Solusi Final & Rencana Eksekusi</Text>
                <View style={s.card}>
                    <Text style={s.text}>{data.idsSession.solutions}</Text>
                </View>
            </Page>
        )}

    </Document>
);

export default L10PDFDocument;