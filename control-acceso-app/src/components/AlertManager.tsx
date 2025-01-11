import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Button, Text } from 'react-native-paper';

type ConfirmationAlertProps = {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export const useConfirmationAlert = () => {
  const [visible, setVisible] = useState(false);
  const [alertData, setAlertData] = useState<ConfirmationAlertProps | null>(null);

  const showAlert = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    setAlertData({ title, message, onConfirm, onCancel });
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  const ConfirmationDialog = () => (
    <Portal>
      <Dialog visible={visible} onDismiss={hideAlert}>
        <Dialog.Title>{alertData?.title}</Dialog.Title>
        <Dialog.Content>
          <Text>{alertData?.message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideAlert}>Cancelar</Button>
          <Button
            onPress={() => {
              hideAlert();
              alertData?.onConfirm();
            }}
          >
            Confirmar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return { showAlert, ConfirmationDialog };
};
