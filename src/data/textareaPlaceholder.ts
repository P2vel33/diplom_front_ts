const str: string = `Пример заполнения YAML-файла:
all:
  children:
    control_nodes:
      hosts:
        node1:
          custom_hostname: suyos01a.svl.ibm.com
          management_network:
            network1:
              ip: 9.30.16.141
        node2:
          custom_hostname: suyos01b.svl.ibm.com
          management_network:
            network1:
              ip: 9.30.16.142
        node3:
          custom_hostname: suyos01c.svl.ibm.com
          management_network:
            network1:
              ip: 9.30.16.143
    switches:
      hosts:
        FabSw1a:
          # Запускается на управляющем узле, а не удаленно
          ansible_host: localhost
          # Есть ли вообще здесь внешняя связь?
          external_connection_enabled: True
          # Если этот параметр - True, следующий раздел заполняется
          external_connection_config:
            # Конфигурация первой связи
            external_link1:
              # Порты для включения в эту связь в виде списка 'номер', 'номер'
              switch_ports: ['48']
              # та же конфигурация для всех значений в switch_ports
              port_config:
                mtu: 9000
                link_speed: 10000
              # Какие VLAN поступают на этот порт (и через мост)
              vlans: ['4080']
              # True означает, что мы принимаем только пакеты с тегами из внешнего источника
              # False означает, что мы принимаем только пакеты без тегов из внешнего источника
              strict_vlan: False
              # Имя этой ссылки
              name: h0
              # True указывает, что в этом соединении есть несколько связей
              lacp_link: false
              # Скорость обновления LACP. (Fast или Slow)
              lacp_rate: Fast
              # ID CLAG для этой связи, 0, если нет CLAG
              clag_id: 0
              # У этого коммутатора должна быть соответствующая конфигурация (и тот же clag_id)
              # Используйте False для связей с единственным коммутатором
              partner_switch: False
  vars:
    app_fqdn: suyos01.svl.ibm.com
    #(выберите из списка часовых поясов timedatectl)
    timezone: 'America/Los_Angeles'
    #должен начинаться с сервера или пула
    time_servers: ['<НЕОБЯЗАТЕЛЬНО>']
    dns_servers: ['9.30.31.32']
    management_network:
      network1:
        subnet: 9.30.16.0
        # только число, без дробной черты
        prefix: 25
        gateway: 9.30.16.129
        floating_ip: 9.30.16.144
        mtu: 1500
        custom_routes:
    application_network_enabled: True
    application_network:
      network1:
        default_gateway: true
        vlan: 4080
        # только число, без дробной черты
        prefix: 25
        gateway: 9.30.20.1
        floating_ip: 9.30.20.40
        mtu: 9000
        custom_routes:`;

export default str;
