#!/bin/bash
# ============================================
# 修正伺服器日期和時區
# ============================================

echo "檢查目前系統時間..."
date
echo ""

echo "檢查時區設定..."
timedatectl
echo ""

echo "設定時區為 Asia/Taipei..."
sudo timedatectl set-timezone Asia/Taipei
echo ""

echo "同步系統時間（使用 NTP）..."
sudo timedatectl set-ntp true
echo ""

echo "強制同步時間..."
sudo ntpdate -s time.stdtime.gov.tw || sudo ntpdate -s pool.ntp.org
echo ""

echo "檢查修正後的時間..."
date
timedatectl
echo ""

echo "完成！如果時間還是不正確，可能需要："
echo "1. 檢查 NTP 服務是否正常運作"
echo "2. 手動設定時間：sudo date -s '2026-01-28 06:09:00'"

