<template>
  <Modal
    v-model="showModal"
    :mask-closable="false"
    :title="modalTitle">
    <Form
      ref="modalForm"
      :label-width="100"
      :model="modalForm"
      :rules="formValidate">
      <FormItem label="告警名称：" prop="alarmName">
        <Input
          type="text"
          :maxlength="60"
          v-model="modalForm.alarmName" :disabled="cantEdit">
        </Input>
      </FormItem>
      <FormItem label="告警级别：" prop="alarmLevel" required>
        <Select v-model="modalForm.alarmLevel" :disabled="cantEdit">
          <Option :value="1">一级</Option>
          <Option :value="2">二级</Option>
          <Option :value="3">三级</Option>
        </Select>
      </FormItem>
      <FormItem label="告警类型：" prop="alarmType" required>
        <Select v-model="modalForm.alarmType" :disabled="cantEdit">
          <Option :value="1">任务审核超时告警</Option>
          <Option :value="2">任务处理超时告警</Option>
        </Select>
      </FormItem>
      <FormItem label="任务类型：" prop="taskType" required>
        <Select v-model="modalForm.taskType" :disabled="cantEdit">
          <Option :value="1">运维服务</Option>
          <Option :value="2">运维培训</Option>
          <Option :value="3">运维咨询</Option>
        </Select>
      </FormItem>
      <FormItem label="当申请提交" prop="day">
        <Input
          type="number"
          v-model="modalForm.day"
          style="width: 80px; margin-right: 10px;"
          :disabled="cantEdit">
        </Input>天后，未审核/未处理完毕，产生告警。
      </FormItem>
    </Form>
    <div slot="footer">
      <Button class="modalBtn" type="default" @click="showModal = false" size="large">取消</Button>
      <Button v-if="!cantEdit" class="modalBtn" type="primary" @click="saveInfo" size="large">确定</Button>
    </div>
  </Modal>  
</template>

<script>
import {mapState} from 'vuex'
import api from '@/api/axiosApi'
import operationApiList from '@/api/operationApiList'

const ACTS = {
  edit: 'edit',
  create: 'create',
  detail: 'detail'
}
export default {
  props: {
    currentAct: {
      type: String,
      default: ACTS.create
    }
  },
  data () {
    return {
      showModal: false,
      modalForm: {
        // 告警名称
        alarmName: '',
        // 告警级别
        alarmLevel: 0,
        // 告警类型
        alarmType: 0,
        // 任务类型
        taskType: 0,
        // 时间
        day: ''
      },
      formValidate: {
        alarmName: [{required: true, message: '不可为空', trigger: 'blur'}],
        alarmLevel: [{
          validator: (rule, value, cb) => {
            if (!value) {
              cb(new Error('必选'))
              return
            }
            cb()
          },
          trigger: 'change'
        }],
        alarmType: [{
          validator: (rule, value, cb) => {
            if (!value) {
              cb(new Error('必选'))
              return
            }
            cb()
          },
          trigger: 'change'
        }],
        taskType: [{
          validator: (rule, value, cb) => {
            if (!value) {
              cb(new Error('必选'))
              return
            }
            cb()
          },
          trigger: 'change'
        }],
        day: [{
          validator: (rule, value, cb) => {
            let reg =  /^(\+?[1-9][0-9]*)$/
            if (!reg.test(value)) {
              cb(new Error('请输入小于等于六位数长度的正整数！'))
              return
            } else if (value.length > 6) {
              cb(new Error('请输入小于等于六位数长度的整数！'))
              return
            } else if (value <= 0) {
              cb(new Error('必须大于0'))
              return
            }
            cb()
          },
          trigger: 'blur'
        }]
      }
    }
  },
  computed: {
    modalTitle () {
      const vm = this
      switch(vm.currentAct) {
        case ACTS.edit:
          return '修改告警规则'
        case ACTS.create:
          return '新增告警规则'
        case ACTS.detail:
          return '告警规则详情'
        default:
          return '新增告警规则'
      }
    },
    cantEdit () {
      return this.currentAct == ACTS.detail
    }
  },
  methods: {
    open(id) {
      const vm = this
      // 清空数据
      vm.$refs.modalForm.resetFields()
      if (id) {
        vm.modalForm.id = id
        api(operationApiList.alarmGet, {
          id
        }).then(res => {
          if (res.data.errcode === 0) {
            vm.modalForm = res.data.data
          }
        }, error => {console.log(error)})
      } else {
        delete vm.modalForm.id
      }
      vm.showModal = true
    },
    saveInfo () {
      const vm = this
      if (vm.cantEdit) {
        vm.showModal = false
        return
      }
      let url = operationApiList.alarmUpdate
      if (vm.currentAct == ACTS.create) {
        url = operationApiList.alarmSave
      }
      vm.$refs.modalForm.validate(valid => {
        if (valid) {
          api(url, {
            ...vm.modalForm
          }).then(res => {
            if (res.data.errcode === 0) {
              vm.showModal = false
              vm.$emit('on-ok')
            }
          }, error => {console.log(error)})
        } else {
          vm.$Message.info('表单验证失败！')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped></style>
