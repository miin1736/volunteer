# 이월(E wall) 프로젝트 개요

## 프로젝트 소개

이월(E wall)은 아웃도어 및 고품질 브랜드의 이월 상품을 한 곳에서 비교하고 찾을 수 있는 서비스입니다. 사용자는 브랜드별, 카테고리별로 이월 상품을 검색하고, 상세한 속성 필터(다운 비율, 소재, 핏 등)를 통해 원하는 제품을 쉽게 찾을 수 있습니다.

## 핵심 가치

- **고급 필터링**: 충전재, 다운 비율, 후드, 핏, 소재 등 상세한 속성으로 제품 검색
- **가격 비교**: 여러 판매처의 가격을 한눈에 비교
- **알림 서비스**: 관심 상품의 가격 변동이나 재고 입고 시 이메일 알림
- **SEO 최적화**: 브랜드×카테고리 조합별 랜딩 페이지 자동 생성으로 검색 엔진 최적화
- **신뢰성**: 공식 판매처 배지 및 데이터 신뢰도 표시

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **데이터**: 제휴 네트워크 피드(링크프라이스, 쿠팡 파트너스 등)
- **배포**: Node.js 18-22
- **SEO**: 구조화 데이터(JSON-LD), 사이트맵, robots.txt

## 주요 기능 (등록된 이슈 기반)

### 1. MVP 데이터 파이프라인 구축 및 속성 정규화 ([Issue #1](https://github.com/miin1736/volunteer/issues/1))

**목적**: 이월 상품 데이터를 수집하고 속성을 정규화하여 검색 가능한 형태로 가공

**주요 작업**:
- 제휴/공식 데이터 피드 수집 (링크프라이스, 쿠팡 파트너스 등)
- 속성 사전 설계 및 구현 (충전재, 다운 비율, 소재, 핏 등)
- 정규화/필터링/중복 제거 로직
- 가격 및 재고 자동 동기화
- 신뢰도 레이어 설계 (명시/설명 추출/이미지 추정)

**성과 목표**:
- 500개 샘플 데이터 정규화 완료
- 속성 필터 기반 리스트업 서비스 구현 기반 마련

**우선순위**: High  
**상태**: Open (진행 중)

---

### 2. 초기 콘텐츠 및 마케팅 전략 ([Issue #2](https://github.com/miin1736/volunteer/issues/2))

**목적**: 서비스 차별화 포인트를 알리기 위한 큐레이션 콘텐츠 제작 및 초기 마케팅

**주요 작업**:
- 브랜드×카테고리별 큐레이션 글 10-15편 제작
  - 예: 다운 90/10 특가 모음, 고어텍스 하드쉘 이월 특가 등
- SEO 키워드 전략 수립
- 커뮤니티/블로그/SNS 배포 계획
- GA4/서치콘솔 트래킹 설정

**성과 목표**:
- 초기 트래킹 유입 및 리텐션 확보
- 서비스 인지도 향상

**우선순위**: Medium  
**상태**: Open

---

### 3. 랜딩 및 고급 필터 UI ([Issue #3](https://github.com/miin1736/volunteer/issues/3))

**목적**: 브랜드×카테고리별 랜딩 페이지와 고급 속성 필터 UI/UX 구현

**주요 작업**:
- 브랜드×카테고리 그리드 랜딩 자동 생성 (SEO 최적화)
- 할인율/가격/신규 등 정렬 기능
- 고급 필터 UI (충전재, 다운 비율, 후드, 핏, 소재 등)
- 상품 상세 정보 표시 (스펙/가격/판매처/신뢰도)
- 공식 판매처 배지
- 구조화 데이터 (Product/Offer)
- 사이트맵/서치콘솔 적용

**현재 구현 상태** ✅:
- `app/(ewall)/[brand]/[category]/page.tsx`: 서버 렌더링 리스트 및 필터/정렬
- `components/Filters.tsx`: URL 파라미터 업데이트 클라이언트 컴포넌트
- `lib/types.ts`, `lib/seo.ts`: 타입 정의 및 SEO 헬퍼
- `lib/search.ts`: 데모 인메모리 필터링
- `data/sample-products.json`: 샘플 데이터
- SEO 기본값 및 정적 프리렌더 (SSG/ISR) 적용
- sitemap/robots 추가

**DoD (완료 조건)**:
- ✅ 브랜드×카테고리별 랜딩 페이지 50개 이상 자동 생성
- ✅ 고급 필터 UI/UX 프로토타입 완성
- ✅ SEO 구조화 데이터/사이트맵/서치콘솔 등록
- ✅ 예시 상품 리스트 연동
- 코드 리뷰 및 QA 완료

**우선순위**: High  
**상태**: Open (대부분 구현 완료, QA 중)

**진행 로그**:
- 2025-10-18: MVP 스캐폴딩 반영 (랜딩/필터/SEO, sample data)
- 2025-10-18: SEO 기본값 및 SSG/ISR 적용, CI smoke 통과

---

### 4. 알림 및 리텐션 기능 MVP ([Issue #4](https://github.com/miin1736/volunteer/issues/4))

**목적**: 사용자 관심 조건 저장 및 가격 변동 시 이메일 알림 기능

**주요 작업**:
- 관심 필터 저장 기능 (브랜드, 카테고리, 주요 속성)
- 가격/재고 변동 감지 및 알림 트리거 로직
- 이메일 알림 MVP 구현
- 알림 클릭 트래킹 및 리텐션 데이터 수집

**현재 구현 상태** 🔨:
- ✅ `emails/price-drop.html`: 가격 하락 이메일 템플릿
- ✅ `/api/out`: 아웃바운드 트래킹 엔드포인트 (302 리다이렉트, subId 추가)

**체크리스트**:
- [ ] 관심 필터 DB 스키마 설계
- [ ] 변동 감지 배치 잡 구현
- ✅ 이메일 알림 템플릿 및 발송 연동 (템플릿 준비 완료)
- [ ] 알림 클릭 이벤트 수집 및 리텐션 데이터 표시
- [ ] UX 개선 피드백 수집 및 적용

**우선순위**: High  
**상태**: Open (일부 구현 완료)  
**의존성**: 데이터 파이프라인 및 리스트업 UI 연동 이후

**진행 로그**:
- 2025-10-18: 알림/리텐션 관련 템플릿 및 엔드포인트 반영
- 2025-10-18: CI smoke 및 SEO/SSG 작업 동기화 완료

---

### 5. CI 및 로컬 스모크 테스트 체계 ([Issue #5](https://github.com/miin1736/volunteer/issues/5))

**목적**: 품질 보증 및 회귀 방지를 위한 CI/로컬 스모크 테스트 체계 운영

**주요 작업**:
- `.github/workflows/ewall-smoke.yml`: CI 스모크 워크플로우
- `scripts/smoke.local.sh`, `scripts/smoke.local.ps1`: 로컬 스모크 자동화
- 주요 체크리스트:
  - ✅ 빌드 성공
  - ✅ /BrandA/down 200 응답
  - ✅ 필터/정렬 동작
  - ✅ JSON-LD 포함
  - ✅ /api/out 리다이렉트
  - ✅ Feed parser 실행
- 실패 시 Alert, 로그, 수정 PR 플로우
- 정기 테스트 결과 점검 및 유지보수

**현재 구현 상태** ✅:
- CI 워크플로우 및 스크립트 반영
- GitHub Actions smoke 워크플로우 정상 통과
- SEO/SSG 및 PR #6 반영 후 재통과
- Landing/JSON-LD/sitemap/robots 체크 강화

**우선순위**: Medium  
**상태**: Open (구현 완료, 운영 중)

**진행 로그**:
- 2025-10-18: Smoke 워크플로우/스크립트 저장소 반영, 1차 정상 작동 확인
- 2025-10-18: GitHub Actions smoke 워크플로우 정상 통과

---

# 프로젝트 구조 및 핵심 개념 설명

## 📁 디렉터리 구조

### app - Next.js 애플리케이션 계층
```
app/
├── (ewall)/                    # Route 그룹 (URL에 포함 안 됨)
│   └── [brand]/[category]/     # 동적 라우팅: 브랜드×카테고리 랜딩
│       ├── page.tsx            # 상품 목록 페이지
│       └── [slug]/page.tsx     # 상품 상세 페이지
├── api/
│   ├── alerts/route.ts         # 알림 CRUD API
│   └── out/route.ts            # 아웃바운드 리다이렉트 + 클릭 트래킹
├── layout.tsx                  # 루트 레이아웃
├── page.tsx                    # 홈페이지
└── sitemap.ts                  # 동적 사이트맵 생성
```

**핵심 개념:**
- **App Router**: Next.js 13+ 라우팅 시스템. 파일 시스템 기반.
- **Dynamic Routes**: `[brand]`, `[category]`, `[slug]`는 URL 파라미터로 동적 경로 생성.
- **Route Groups**: `(ewall)`은 URL 구조에 영향 없이 폴더 구조만 정리.
- **generateStaticParams**: 빌드 타임에 정적 페이지를 미리 생성 (SSG).

---

### lib - 비즈니스 로직 & 유틸리티
```
lib/
├── attributes/
│   └── index.ts               # 속성 정규화 규칙 (다운비율, 충전재 등)
├── brands.ts                  # 브랜드×카테고리 조합 생성 (데이터 기반)
├── log.ts                     # JSONL 로깅 헬퍼
├── search.ts                  # 상품 검색/필터링 로직
├── seo.ts                     # JSON-LD 스키마 생성
└── types.ts                   # TypeScript 타입 정의
```

**핵심 개념:**
- **Normalization**: 다양한 소스의 데이터를 통일된 형식으로 변환.
- **JSON-LD**: 구조화된 데이터 마크업 (Google 검색 최적화).
- **Server-side only**: lib는 서버에서만 실행 (Node.js API 사용 가능).

---

### scripts - 배치 작업 & 크론
```
scripts/
├── cron/
│   ├── syncOffers.ts          # 가격/재고 동기화 + 변동 감지
│   └── rollupClicks.ts        # 클릭 데이터 일일 집계
├── smoke/
│   └── filters.ts             # 필터 기능 스모크 테스트
├── parseFeeds.ts              # 피드 파서 (정규화 + 스냅샷 생성)
└── tsconfig.scripts.json      # 스크립트 전용 TS 설정
```

**핵심 개념:**
- **ESM (ECMAScript Modules)**: `import/export` 사용. Node.js 네이티브 모듈 시스템.
- **ts-node/esm**: TypeScript를 직접 실행하는 런타임.
- **Batch Job**: 주기적으로 실행되는 백그라운드 작업 (크론).
- **Smoke Test**: 기본 동작 확인용 간단한 테스트.

---

### data & `/out` - 데이터 레이어
```
data/
└── sample-products.json       # 샘플 상품 데이터

out/                           # 생성된 데이터 (gitignore)
├── products.normalized.json   # 정규화된 스냅샷
├── alerts.json/jsonl          # 알림 저장소
├── emails.queue.jsonl         # 발송 대기 이메일 큐 (dry-run)
├── clicks.daily.json          # 클릭 데이터 롤업
└── logs/
    └── normalize.jsonl        # 정규화 실패 로그
```

**핵심 개념:**
- **JSONL (JSON Lines)**: 한 줄에 하나의 JSON 객체. 로그/스트림에 최적.
- **Snapshot**: 특정 시점의 전체 데이터 스냅샷 (비교/롤백용).
- **Queue**: 비동기 작업 대기열 (이메일 발송 등).

---

### components - React 컴포넌트
```
components/
└── Filters.tsx                # 필터 UI (클라이언트 컴포넌트)
```

**핵심 개념:**
- **Client Component**: `"use client"` 지시어. 브라우저에서 인터랙티브 동작.
- **Server Component**: 기본값. 서버에서 렌더링, JS 번들에 포함 안 됨.

---

### db - 데이터베이스 스키마
```
db/
└── schema.sql                 # contact, alert, click 테이블 정의
```

**핵심 개념:**
- **Schema**: 데이터 구조 정의 (현재는 파일 백엔드, 추후 DB 마이그레이션용).

---

### emails - 이메일 템플릿
```
emails/
└── price-drop.html            # 가격 하락 알림 HTML 템플릿
```

---

### workflows - CI/CD
```
.github/workflows/
└── ewall-smoke.yml            # GitHub Actions 워크플로
```

**핵심 개념:**
- **Matrix Build**: 여러 Node 버전에서 병렬 테스트.
- **Artifact Upload**: 실패 시 로그/HTML 저장.
- **Smoke Test**: 빌드/라우트/JSON-LD/파서 기본 동작 검증.

---

## 🔑 필수 개념 요약

### 1. **Next.js App Router**
- 파일 기반 라우팅: `app/[brand]/[category]/page.tsx` → `/BrandA/down`
- SSG (Static Site Generation): `generateStaticParams`로 빌드 타임 생성
- ISR (Incremental Static Regeneration): `revalidate`로 주기적 재생성

### 2. **TypeScript ESM**
- `.ts` 확장자 import: `from "../lib/log.js"` (런타임에 `.js`로 해석)
- tsconfig.json: 컴파일 옵션 (module, moduleResolution 등)
- Named Export vs Default Export: ESM은 named export 권장

### 3. **데이터 파이프라인**
```
원본 피드 → parseFeeds.ts → 정규화 → out/products.normalized.json
                ↓
         lib/attributes (규칙 적용)
                ↓
         실패 로그 → out/logs/normalize.jsonl
```

### 4. **알림 시스템**
```
사용자 조건 저장 (API) → syncOffers.ts (변동 감지) → emails.queue.jsonl
                                                    ↓
                                            (추후) 실제 발송
```

### 5. **SEO 최적화**
- JSON-LD: 구조화된 데이터 (Product 스키마)
- Sitemap: 검색엔진 크롤링 최적화
- Dynamic Meta: 브랜드×카테고리별 맞춤 메타 태그

### 6. **CI/CD 체크리스트**
- ✅ Typecheck (TypeScript 오류)
- ✅ Build (Next.js 빌드 성공)
- ✅ Route 200 (핵심 페이지 접근)
- ✅ JSON-LD 검증 (스키마 필수 필드)
- ✅ Parser Smoke (데이터 변환 성공)
- ✅ Filter Smoke (속성 필터 동작)

---

## 🔄 데이터 흐름 요약

```
1. 데이터 수집
   외부 피드 → parseFeeds.ts → out/products.normalized.json

2. 웹 제공
   normalized.json → lib/search.ts (필터링) → app/[brand]/[category]/page.tsx

3. 알림
   사용자 조건 → alerts API → syncOffers.ts (diff) → emails.queue.jsonl

4. 트래킹
   사용자 클릭 → /api/out → .data/clicks.ndjson → rollupClicks.ts
```

---

## 🚀 주요 기술 스택

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes, Node.js ESM
- **Data**: JSON/JSONL (file-based MVP), 추후 PostgreSQL/Redis
- **CI/CD**: GitHub Actions
- **SEO**: JSON-LD, Sitemap, Dynamic Meta
- **Testing**: Smoke tests (기능 검증)

---

## 개발 로드맵

### MVP 단계 (현재)
1. ✅ 기본 랜딩 페이지 및 필터 UI 구현
2. ✅ SEO 최적화 (sitemap, robots, JSON-LD)
3. ✅ CI/CD 스모크 테스트 체계
4. ✅ 아웃바운드 트래킹 엔드포인트
5. 🔨 데이터 파이프라인 구축 (진행 중)
6. 🔨 알림 기능 백엔드 구현 (진행 중)

### 다음 단계
1. ⏳ 실제 데이터 피드 연동
2. ⏳ 관심 필터 저장 기능
3. ⏳ 가격 변동 감지 배치 잡
4. ⏳ 큐레이션 콘텐츠 제작 및 마케팅
5. ⏳ 사용자 피드백 기반 UX 개선

## 성과 지표

- **트래픽**: GA4/서치콘솔 기반 유입 분석
- **리텐션**: 재방문률 및 알림 클릭률
- **전환**: 제휴 링크 클릭 및 구매 전환률
- **SEO**: 검색 노출 및 순위
- **품질**: CI 테스트 통과율

## 개발 환경 설정

### 요구사항
- Node.js 18-22

### 로컬 실행
```bash
npm install
npm run dev
# http://localhost:3000
```

### 빌드
```bash
npm run build
npm start
```

### 타입 체크
```bash
npm run typecheck
```

### 로컬 스모크 테스트
```bash
# Bash
./scripts/smoke.local.sh

# PowerShell
./scripts/smoke.local.ps1
```

## 기여 및 문의

- **프로젝트 관리**: @miin1736
- **이슈 트래커**: [GitHub Issues](https://github.com/miin1736/volunteer/issues)
- **마일스톤**: E wall MVP

---

**마지막 업데이트**: 2025-11-17  
**프로젝트 상태**: MVP 개발 진행 중
