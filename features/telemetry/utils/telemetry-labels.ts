const KEY_LABELS: Record<string, string> = {
    // Potencia activa
    'P': 'Potencia activa',
    'P1': 'Potencia activa L1',
    'P2': 'Potencia activa L2',
    'P3': 'Potencia activa L3',
    
    // Potencia reactiva
    'Q': 'Potencia reactiva',
    'Q1': 'Potencia reactiva L1',
    'Q2': 'Potencia reactiva L2',
    'Q3': 'Potencia reactiva L3',
    
    // Potencia aparente
    'S': 'Potencia aparente',
    'S1': 'Potencia aparente L1',
    'S2': 'Potencia aparente L2',
    'S3': 'Potencia aparente L3',
    
    // Voltaje fase-neutro
    'V': 'Voltaje',
    'V1': 'Voltaje L1-N',
    'V2': 'Voltaje L2-N',
    'V3': 'Voltaje L3-N',
    
    // Voltaje línea-línea
    'U1': 'Voltaje L1-L2',
    'U2': 'Voltaje L2-L3',
    'U3': 'Voltaje L3-L1',
    
    // Corriente
    'I': 'Corriente',
    'I1': 'Corriente L1',
    'I2': 'Corriente L2',
    'I3': 'Corriente L3',
    'In': 'Corriente neutro',
    
    // Frecuencia
    'F': 'Frecuencia',
    
    // Factor de potencia
    'PF': 'Factor de potencia',
    'PF1': 'Factor de potencia L1',
    'PF2': 'Factor de potencia L2',
    'PF3': 'Factor de potencia L3',
    
    // Energía activa
    'Edelta': 'Energía',
    'E1delta': 'Energía L1',
    'E2delta': 'Energía L2',
    'E3delta': 'Energía L3',
    
    // Energía exportada
    'Ex': 'Energía exportada',
    'Ex1': 'Energía exportada L1',
    'Ex2': 'Energía exportada L2',
    'Ex3': 'Energía exportada L3',
    
    // Energía reactiva
    'RE': 'Energía reactiva',
    'RE1': 'Energía reactiva L1',
    'RE2': 'Energía reactiva L2',
    'RE3': 'Energía reactiva L3',
    
    // Energía aparente
    'AE': 'Energía aparente',
    'AE1': 'Energía aparente L1',
    'AE2': 'Energía aparente L2',
    'AE3': 'Energía aparente L3',
}

export function getKeyLabel(key: string): string {
    return KEY_LABELS[key] || key
}