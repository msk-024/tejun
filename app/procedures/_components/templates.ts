export type ProcedureTemplate = {
  id: string
  name: string
  content: string
}

export const PROCEDURE_TEMPLATES: ProcedureTemplate[] = [
  {
    id: 'procedure',
    name: '処置手順',
    content: `## 目的

（この処置の目的を記載）

## 必要物品

-
-

## 実施手順

1.
2.
3.

## 注意事項

-

## 観察ポイント

- `,
  },
  {
    id: 'medication',
    name: '薬剤投与手順',
    content: `## 薬剤情報

| 項目 | 内容 |
|------|------|
| 薬剤名 |  |
| 規格・用量 |  |
| 投与経路 |  |
| 投与速度 |  |

## 投与前確認

- 患者確認（氏名・生年月日）
- アレルギー確認
- 指示確認（6R確認）
- 点滴ルート・刺入部確認

## 実施手順

1.
2.
3.

## 副作用・注意事項

- `,
  },
  {
    id: 'observation',
    name: '観察手順',
    content: `## 観察目的

（なぜ観察するかを記載）

## 観察項目

| 項目 | 観察内容 | 正常範囲 |
|------|----------|----------|
|  |  |  |
|  |  |  |

## 異常時の対応

1.
2.
3. `,
  },
  {
    id: 'emergency',
    name: '緊急時対応',
    content: `## 対応が必要な状況

（どのような状態のときに対応するかを記載）

## 初期対応

1.
2.
3.

## 応援要請・報告（SBAR）

- **S（Situation・状況）**：
- **B（Background・背景）**：
- **A（Assessment・評価）**：
- **R（Recommendation・要請）**：

## 記録

- `,
  },
]
