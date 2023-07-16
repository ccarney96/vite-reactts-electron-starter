export interface Agent {
    uuid: string;
    displayName: string;
    description: string;
    developerName: string;
    displayIcon: string;
    fullPortrait: string;
    killfeedPortrait: string;
    assetPath: string;
    isFullPortraitRightFacing: boolean;
    isPlayableCharacter: boolean;
    isAvailableForTest: boolean;
    role: string;
    abilities: any[];
}
