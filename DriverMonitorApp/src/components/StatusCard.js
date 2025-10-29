import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StatusCard({ title, value, color, icon }) {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Paragraph style={styles.title}>{title}</Paragraph>
          <Title style={[styles.value, { color }]}>{value}</Title>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    margin: '1%',
    marginBottom: 8,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});






