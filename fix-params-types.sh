#!/bin/bash

# 批量修復 Next.js 15+ params Promise 類型錯誤
# 將所有 { params: { communityId: string } } 改為 { params: Promise<{ communityId: string }> }
# 並將 params instanceof Promise ? await params : params 改為 await params

# 需要修復的檔案列表
FILES=(
  "app/api/communities/[communityId]/ideas/route.ts"
  "app/api/communities/[communityId]/members/route.ts"
  "app/api/communities/[communityId]/kanban/route.ts"
  "app/api/communities/[communityId]/convergence-comments/route.ts"
  "app/api/communities/[communityId]/idea-wall/view-state/route.ts"
  "app/api/communities/[communityId]/idea-trend/route.ts"
  "app/api/communities/[communityId]/network-graph/route.ts"
  "app/api/communities/[communityId]/network-graph/view-state/route.ts"
  "app/api/communities/[communityId]/network-graph/positions/route.ts"
  "app/api/communities/[communityId]/idea-stats/route.ts"
  "app/api/communities/[communityId]/resources/route.ts"
  "app/api/communities/[communityId]/resources/[resourceId]/download/route.ts"
  "app/api/communities/[communityId]/kanban/tasks/[taskId]/move/route.ts"
  "app/api/ideas/[ideaId]/route.ts"
  "app/api/notifications/[notificationId]/read/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "修復 $file"
    # 替換 params 類型定義
    sed -i 's/{ params }: { params: { communityId: string } }/{ params }: { params: Promise<{ communityId: string }> }/g' "$file"
    sed -i 's/{ params }: { params: { ideaId: string } }/{ params }: { params: Promise<{ ideaId: string }> }/g' "$file"
    sed -i 's/{ params }: { params: { notificationId: string } }/{ params }: { params: Promise<{ notificationId: string }> }/g' "$file"
    sed -i 's/{ params }: { params: { communityId: string; taskId: string } }/{ params }: { params: Promise<{ communityId: string; taskId: string }> }/g' "$file"
    sed -i 's/{ params }: { params: { communityId: string; resourceId: string } }/{ params }: { params: Promise<{ communityId: string; resourceId: string }> }/g' "$file"
    # 替換 params 解析邏輯
    sed -i 's/const resolvedParams = params instanceof Promise ? await params : params/const resolvedParams = await params/g' "$file"
    echo "✅ $file 已修復"
  else
    echo "⚠️ $file 不存在，跳過"
  fi
done

echo "✅ 所有檔案修復完成"


