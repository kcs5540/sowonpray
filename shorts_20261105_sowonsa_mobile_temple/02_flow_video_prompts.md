# 제주 소원사 모바일 법당 쇼츠 - 구글 플로우(Flow) 씬별 영상 생성 프롬프트
> 규격: 9:16 세로형 (Shorts/Reels) | Image-to-Video 2단계 방식

---

### 🎬 Scene 01. 도입 후킹 (0~8초) [실제 소원사 대웅전 참배 화면 탑재 완료]
- **대사**: "어디 계시든, 부처님은 늘 당신 곁에 계십니다. 전국 사찰 최초로, 제주 소원사가 스마트폰 안의 작은 법당을 열었습니다."
- **[1단계 확정 시작 이미지]**: 
  - 파일명: `scene01_flow_input_base.jpg` (1080x1920 세로형 9:16)
  - 내용: 따뜻한 한옥 저녁 조명 속에서 양손으로 스마트폰을 쥐고 있는 구도. 스마트폰 화면에 **실제 제주 소원사 삼존불 제단과 3D 동자승 참선 모바일 법당 화면**이 선명하게 발광하며 합성됨.
- **[2단계 비디오 모션 프롬프트 (구글 플로우 Video 생성창에 입력)]**:
  > Slow cinematic camera push-in towards the glowing smartphone screen held by gentle hands, the sacred Korean Buddhist temple altar and golden Buddha statues on the screen glow with serene divine light, soft warm ambient room light with subtle floating golden dust particles, screen's amber illumination softly reflecting on the hands, high-end commercial cinematography, peaceful reverent temple atmosphere, strictly no distortion, strictly no dialogue.
- **저장 파일명**: `scene01_hook_smartphone.mp4`

---

### 🎬 Scene 02. 마음의 공감 (8~18초)
- **대사**: "몸이 아파서 절에 못 가시는 부모님도, 퇴근길 지친 일상에 마음 쉴 곳 없는 불자님도."
- **[1단계 이미지 프롬프트]**:
  > Vertical 9:16 split visual feel or alternating warm shot: an elderly kind Korean grandmother with gentle smile sitting comfortably near a sunlit window with folded prayer hands, warm sunlight shining through sheer curtains, reverent peaceful expression, cinematic lighting, 8k.
- **[2단계 비디오 모션 프롬프트]**:
  > Very subtle slow zoom-in on the grandmother's peaceful hands in prayer (Hapjang), soft morning breeze moving the sheer curtains, tranquil cinematic lighting, peaceful ambient sound of gentle wind, strictly no speech.
- **저장 파일명**: `scene02_empathy_prayers.mp4`

---

### 🎬 Scene 03. 대웅전 소원등과 스님의 정성스런 축원 예불 (제주 소원사 실제 대웅전 기반)
- **대사**: "언제 어디서나 마음을 담아 소원등을 켜보세요. 매일 오전 10시, 제주 소원사 대웅전 사시예불에서 주지 스님께서 불자님 가정의 서원을 직접 정성껏 축원해 드립니다."
- **[연출 콘셉트]**: 방금 올려주신 제주 소원사 대웅전 삼존불 제단 앞에서, 경건한 가사를 수하신 주지 스님께서 합장하고 부처님 전을 향해 정성껏 사시예불 축원을 올리시는 장엄한 모습 연출.
- **[1단계 이미지 프롬프트 (스님이 예불 올리는 구도 생성용)]**:
  > Vertical 9:16 cinematic angle inside Jeju Sowonsa Daewoongjeon temple hall, in front of the magnificent wooden Buddhist altar with three golden Buddha statues and intricate Dancheong canopy, a revered Korean Buddhist head monk in traditional grey monastic robe and brown ceremonial sash (Gasa) stands with palms joined in deep reverent prayer (Hapjang), facing towards the golden Buddha statues, glowing amber candlelight and soft incense smoke drifting through sacred morning light, holy and peaceful atmosphere, photorealistic 8k, masterwork.
- **[2단계 비디오 모션 프롬프트 (구글 플로우 입력용)]**:
  > Slow cinematic push-in behind the Korean Buddhist monk praying in front of the golden Buddha altar, monk gently bows head in deep solemn prayer, delicate wisps of incense smoke curling upwards towards the ornate wooden ceiling, warm golden candlelights flickering gently, serene authentic temple bell and deep chanting echo ambient sound, reverent spiritual atmosphere, strictly no distortion, strictly no foreign dialogue.
- **저장 파일명**: `scene03_sowonsa_monk_yebul.mp4`

---

### 🎬 Scene 04. 목탁 명상 & 한줄사경 힐링 (30~42초)
- **대사**: "마음이 복잡할 땐 조용한 108 목탁 소리에 생각을 비우고, 마음을 맑히는 한 줄 사경으로 복덕을 쌓아보세요."
- **[1단계 이미지 프롬프트]**:
  > Vertical 9:16 macro close-up of a traditional wooden Buddhist Moktak instrument resting on a silk cushion next to delicate calligraphy brush and Korean Hanji paper, serene bamboo garden softly blurred in background, warm afternoon glow, tranquil zen aesthetic, ultra sharp details, 8k.
- **[2단계 비디오 모션 프롬프트]**:
  > Extremely smooth orbital pan around the wooden Moktak, gentle soft focus shift to the calligraphy script glowing subtly, soothing realistic rhythmic wooden Moktak strike echo sound (ASMR), completely peaceful.
- **저장 파일명**: `scene04_moktak_sutra.mp4`

---

### 🎬 Scene 05. 엔딩 및 콜투액션 [B안: 부처님 가피 오버레이 버전]
- **대사**: "당신의 가장 가까운 법당, 지금 제주 소원사 모바일 법당에서 등불을 밝혀보세요. 성불하십시오."
- **[연출 콘셉트]**: 대표님이 올려주신 깔끔한 소원등 축원 카드(`scene05_clean_card_lantern.jpg`)가 중앙에서 빛나고, 그 뒤편 배경 어둠 속에서 자비로운 황금빛 석가모니 부처님의 실루엣과 온화한 미소가 신비로운 광배(후광)와 함께 은은하게 비치며 불자님을 감싸주는 감동적인 연출.
- **[1단계 이미지 프롬프트 (Flow Image용)]**:
  > Vertical 9:16 sacred cinematic visual, centered floating smartphone glowing softly with Jeju Sowonsa golden lotus lantern screen, in the misty dark background behind the phone rises a majestic translucent ethereal golden Buddha statue (Gautama Buddha) with serene benevolent compassionate smile and faint divine halo of golden light rays (Aura), soft glowing embers floating in sacred temple air, mysterious elegant spiritual lighting, high-end commercial Buddhist art, 8k resolution, photorealistic masterpiece.
- **[2단계 비디오 모션 프롬프트 (Flow Video용)]**:
  > Slow majestic camera push-in towards the glowing smartphone screen, the translucent golden Buddha in the background softly reveals and illuminates with gentle divine golden light pulsing rhythmically, warm light rays enveloping the smartphone and hands, serene resonant temple bell chime dissolving gently into peaceful silence, holy and tear-inducing emotional warmth, strictly no distortion, strictly no dialogue.
- **저장 파일명**: `scene05_buddha_gapi_overlay.mp4`
