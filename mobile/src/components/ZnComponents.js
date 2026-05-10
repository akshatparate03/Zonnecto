// src/components/ZnComponents.js
// All reusable components in one file

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Pressable, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONTS, SHADOWS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── ZnButton ────────────────────────────────────────────────────────────────
export function ZnButton({ title, onPress, loading, disabled, variant = 'primary', size = 'md', style }) {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} style={[styles.btnWrap, style]} activeOpacity={0.85}>
        <LinearGradient
          colors={isDisabled ? ['#4a4a6a', '#3a3a5a'] : COLORS.gradientPrimary}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.btn, size === 'sm' && styles.btnSm, size === 'lg' && styles.btnLg]}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={[styles.btnText, size === 'sm' && styles.btnTextSm]}>{title}</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress} disabled={isDisabled} activeOpacity={0.7}
        style={[styles.btnOutline, size === 'sm' && styles.btnSm, style]}
      >
        {loading
          ? <ActivityIndicator color={COLORS.purplePale} size="small" />
          : <Text style={styles.btnOutlineText}>{title}</Text>
        }
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.6} style={style}>
        <Text style={styles.btnGhostText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress} disabled={isDisabled} activeOpacity={0.8}
        style={[styles.btnDanger, style]}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.btnText}>{title}</Text>
        }
      </TouchableOpacity>
    );
  }
}

// ─── ZnInput ─────────────────────────────────────────────────────────────────
export function ZnInput({ label, placeholder, value, onChangeText, secureTextEntry,
  keyboardType, autoCapitalize = 'none', icon, rightIcon, onRightIconPress,
  error, multiline, numberOfLines, style, editable = true }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[
        styles.inputWrap,
        focused && styles.inputWrapFocused,
        error && styles.inputWrapError,
        !editable && styles.inputWrapDisabled,
      ]}>
        {icon && (
          <Ionicons name={icon} size={16} color={COLORS.purplePale} style={styles.inputIcon} />
        )}
        <TextInput
          style={[styles.input, icon && { paddingLeft: 8 }, multiline && { height: numberOfLines * 22, textAlignVertical: 'top' }]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDim}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.inputRightIcon}>
            <Ionicons name={rightIcon} size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
}

// ─── ZnCard ──────────────────────────────────────────────────────────────────
export function ZnCard({ children, style, onPress }) {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── ZnDialog ────────────────────────────────────────────────────────────────
export function ZnDialog({ visible, title, message, icon, confirmLabel = 'Confirm',
  cancelLabel = 'Cancel', confirmColor, onConfirm, onCancel, highlight }) {

  const confirmBg = confirmColor === '#ef4444'
    ? ['#ef4444', '#dc2626']
    : ['#7c3aed', '#6366f1'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.dialogOverlay} onPress={onCancel}>
        <Pressable style={styles.dialogCard} onPress={e => e.stopPropagation()}>
          {icon && <Text style={styles.dialogIcon}>{icon}</Text>}
          <Text style={styles.dialogTitle}>{title}</Text>
          {message && <Text style={styles.dialogMessage}>{message}</Text>}
          {highlight && (
            <View style={styles.dialogHighlight}>
              <Text style={styles.dialogHighlightText}>"{highlight}"</Text>
            </View>
          )}
          <View style={styles.dialogActions}>
            {cancelLabel && (
              <TouchableOpacity style={styles.dialogBtnCancel} onPress={onCancel} activeOpacity={0.7}>
                <Text style={styles.dialogBtnCancelText}>{cancelLabel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.dialogBtnConfirmWrap} onPress={onConfirm} activeOpacity={0.85}>
              <LinearGradient colors={confirmBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.dialogBtnConfirm}>
                <Text style={styles.btnText}>{confirmLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── ZnBadge ─────────────────────────────────────────────────────────────────
export function ZnBadge({ label, color = COLORS.purple, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}44` }, style]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── ZnLoader ────────────────────────────────────────────────────────────────
export function ZnLoader({ size = 'large', style }) {
  return (
    <View style={[styles.loaderWrap, style]}>
      <ActivityIndicator size={size} color={COLORS.purplePale} />
    </View>
  );
}

// ─── ZnEmpty ─────────────────────────────────────────────────────────────────
export function ZnEmpty({ icon = '😶', title, subtitle, action, onAction }) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {action && (
        <ZnButton title={action} onPress={onAction} style={{ marginTop: SPACING.lg }} />
      )}
    </View>
  );
}

// ─── ZnAvatar ────────────────────────────────────────────────────────────────
import { Image } from 'react-native';
export function ZnAvatar({ uri, username, size = 40, style }) {
  const initials = username ? username.slice(0, 2).toUpperCase() : '??';
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }
  return (
    <LinearGradient
      colors={COLORS.gradientPurple}
      style={[{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.35 }}>{initials}</Text>
    </LinearGradient>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Button
  btnWrap: { borderRadius: RADIUS.md, overflow: 'hidden' },
  btn: { paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  btnSm: { paddingVertical: 10, paddingHorizontal: 16 },
  btnLg: { paddingVertical: 16, paddingHorizontal: 32 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  btnTextSm: { fontSize: 13 },
  btnOutline: {
    paddingVertical: 13, paddingHorizontal: 24, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.purpleBorder,
    backgroundColor: COLORS.purpleBg, alignItems: 'center',
  },
  btnOutlineText: { color: COLORS.purplePale, fontSize: 15, fontWeight: '600' },
  btnGhostText: { color: COLORS.textMuted, fontSize: 14 },
  btnDanger: {
    paddingVertical: 13, paddingHorizontal: 24, borderRadius: RADIUS.md,
    backgroundColor: COLORS.red, alignItems: 'center',
  },

  // Input
  inputContainer: { marginBottom: SPACING.md },
  inputLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  inputWrapFocused: { borderColor: COLORS.purpleBorder, backgroundColor: COLORS.bgInputFocus },
  inputWrapError: { borderColor: COLORS.redBorder },
  inputWrapDisabled: { opacity: 0.5 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 15, paddingVertical: 14 },
  inputRightIcon: { padding: 4 },
  inputError: { fontSize: 12, color: COLORS.redLight, marginTop: 4 },

  // Card
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.lg,
  },

  // Dialog
  dialogOverlay: {
    flex: 1, backgroundColor: 'rgba(7,7,16,0.85)',
    alignItems: 'center', justifyContent: 'center', padding: SPACING.xl,
  },
  dialogCard: {
    width: '100%', maxWidth: 400,
    backgroundColor: '#10091f', borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.purpleBorder,
    padding: SPACING.xxl,
    ...SHADOWS.purple,
  },
  dialogIcon: { fontSize: 36, textAlign: 'center', marginBottom: SPACING.md },
  dialogTitle: { fontSize: 18, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: SPACING.sm },
  dialogMessage: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.lg },
  dialogHighlight: {
    backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.18)', padding: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  dialogHighlightText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', textAlign: 'center' },
  dialogActions: { flexDirection: 'row', gap: SPACING.sm },
  dialogBtnCancel: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  dialogBtnCancelText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  dialogBtnConfirmWrap: { flex: 1, borderRadius: RADIUS.md, overflow: 'hidden' },
  dialogBtnConfirm: { paddingVertical: 12, alignItems: 'center' },

  // Badge
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // Loader
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 20 },
});
