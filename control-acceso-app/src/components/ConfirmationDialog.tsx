import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Portal, Button, Text } from 'react-native-paper';

type ConfirmationDialogProps = {
  visible: boolean;
  title: string;
  message?: string; // Hacemos el mensaje opcional
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string; // Permitir personalizar el texto del botón de confirmación
  cancelLabel?: string; // Permitir personalizar el texto del botón de cancelación
};

export default function ConfirmationDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar', // Valores por defecto
  cancelLabel = 'Cancelar',
}: ConfirmationDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        {message && (
          <Dialog.Content>
            <Text>{message}</Text>
          </Dialog.Content>
        )}
        <Dialog.Actions>
          <Button onPress={onCancel} mode="text" style={styles.cancelButton}>
            {cancelLabel}
          </Button>
          <Button onPress={onConfirm} mode="contained" style={styles.confirmButton}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 8,
  },
  cancelButton: {
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#6200ee',
  },
});
