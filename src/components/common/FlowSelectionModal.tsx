import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import {
  Droplet,
  Droplets,
  Check,
  X,
  Trash2,
  Sparkles,
  CalendarHeart,
} from 'lucide-react-native';
import { PinkButton } from './PinkButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface FlowOption {
  value: string;
  label: string;
  subtitle: string;
  intensity: number;
  emoji: string;
}

export const FLOW_OPTIONS: FlowOption[] = [
  {
    value: 'spotting',
    label: 'Spotting',
    subtitle: 'Barely there, pantyliner only',
    intensity: 1,
    emoji: '🌸',
  },
  {
    value: 'light',
    label: 'Light Flow',
    subtitle: 'Gentle, light protection needed',
    intensity: 2,
    emoji: '💧',
  },
  {
    value: 'medium',
    label: 'Medium Flow',
    subtitle: 'Regular, standard absorption',
    intensity: 3,
    emoji: '💧💧',
  },
  {
    value: 'heavy',
    label: 'Heavy Flow',
    subtitle: 'Heavy bleeding, frequent pad/tampon',
    intensity: 4,
    emoji: '💧💧💧',
  },
  {
    value: 'super',
    label: 'Super / Very Heavy',
    subtitle: 'Very heavy flow, maximum protection',
    intensity: 5,
    emoji: '🩸',
  },
];

export interface FlowSelectionModalProps {
  visible: boolean;
  date?: string | Date;
  initialFlow?: string | null;
  isAlreadyLogged?: boolean;
  onSelectFlow: (flow: string) => void | Promise<void>;
  onRemovePeriod?: () => void | Promise<void>;
  onClose: () => void;
}

export const FlowSelectionModal: React.FC<FlowSelectionModalProps> = ({
  visible,
  date = new Date(),
  initialFlow,
  isAlreadyLogged = false,
  onSelectFlow,
  onRemovePeriod,
  onClose,
}) => {
  const { colors } = useAppTheme();
  const [selectedFlow, setSelectedFlow] = useState<string>('medium');

  useEffect(() => {
    if (initialFlow) {
      setSelectedFlow(initialFlow);
    } else {
      setSelectedFlow('medium');
    }
  }, [initialFlow, visible]);

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const isToday = format(dateObj, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const dateDisplay = isToday ? 'Today' : format(dateObj, 'EEEE, MMM d');

  const handleSelectFlow = (flowVal: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedFlow(flowVal);
  };

  const handleConfirm = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    await onSelectFlow(selectedFlow);
    onClose();
  };

  const handleRemove = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    if (onRemovePeriod) {
      await onRemovePeriod();
    }
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBorder,
              shadowColor: colors.primary,
            },
          ]}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconPill, { backgroundColor: `${colors.primary}18` }]}>
                <Droplets size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Menstrual Flow
                </Text>
                <View style={styles.dateRow}>
                  <CalendarHeart size={12} color={colors.primary} />
                  <Text style={[styles.subtitle, { color: colors.primary }]}>
                    {dateDisplay}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.background }]}
              activeOpacity={0.7}
            >
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Prompt Message */}
          <View style={[styles.promptBox, { backgroundColor: `${colors.primary}08` }]}>
            <Sparkles size={13} color={colors.primary} />
            <Text style={[styles.promptText, { color: colors.text }]}>
              Select your flow intensity before logging your period:
            </Text>
          </View>

          {/* Flow Options List */}
          <ScrollView
            style={styles.optionsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {FLOW_OPTIONS.map((opt) => {
              const isSelected = selectedFlow === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleSelectFlow(opt.value)}
                  style={[
                    styles.optionCard,
                    {
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                      backgroundColor: isSelected ? `${colors.primary}12` : colors.background,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.emojiContainer,
                        {
                          backgroundColor: isSelected
                            ? `${colors.primary}25`
                            : `${colors.primary}10`,
                        },
                      ]}
                    >
                      <Text style={styles.emojiText}>{opt.emoji}</Text>
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionTitle,
                          {
                            color: isSelected ? colors.primary : colors.text,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>
                        {opt.subtitle}
                      </Text>
                    </View>
                  </View>

                  {/* Radio / Check indicator */}
                  <View
                    style={[
                      styles.checkCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <PinkButton
              title={
                isAlreadyLogged
                  ? `Update Flow to ${FLOW_OPTIONS.find((f) => f.value === selectedFlow)?.label || 'Selected'}`
                  : `Log Period (${FLOW_OPTIONS.find((f) => f.value === selectedFlow)?.label || 'Medium'}) 💗`
              }
              onPress={handleConfirm}
              style={{ width: '100%' }}
            />

            {isAlreadyLogged && onRemovePeriod && (
              <TouchableOpacity
                onPress={handleRemove}
                style={[styles.removeButton, { borderColor: `${colors.phases.menstrual}40` }]}
                activeOpacity={0.75}
              >
                <Trash2 size={14} color={colors.phases.menstrual} />
                <Text style={[styles.removeButtonText, { color: colors.phases.menstrual }]}>
                  Remove Period for {dateDisplay}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 22,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  promptText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  optionsList: {
    maxHeight: 280,
  },
  optionsContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emojiContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 11,
    lineHeight: 14,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  actionsContainer: {
    marginTop: 16,
    gap: 8,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
