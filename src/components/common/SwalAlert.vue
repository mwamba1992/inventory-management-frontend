<template>
  <!-- This component doesn't render any visible template -->
</template>

<script setup>
import Swal from 'sweetalert2'

// Props for customization
const props = defineProps({
  // Common props that can be passed
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'success', // success, error, warning, info, question
  },
  confirmButtonText: {
    type: String,
    default: 'OK',
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel',
  },
  showCancelButton: {
    type: Boolean,
    default: false,
  },
  timer: {
    type: Number,
    default: null,
  },
  timerProgressBar: {
    type: Boolean,
    default: false,
  },
})

// Emit events for parent components
const emit = defineEmits(['confirmed', 'cancelled', 'dismissed'])

// Success alert
const showSuccess = (title = 'Success!', text = 'Operation completed successfully.') => {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title,
    text,
    timer: props.timer || 3000,
    timerProgressBar: props.timerProgressBar,
    showConfirmButton: !props.timer,
    confirmButtonText: props.confirmButtonText,
  }).then((result) => {
    if (result.isConfirmed) {
      emit('confirmed', result)
    } else if (result.isDismissed) {
      emit('dismissed', result)
    }
  })
}

// Error alert
const showError = (title = 'Error!', text = 'Something went wrong.') => {
  return Swal.fire({
    timer: props.timer || 3000,
    timerProgressBar: props.timerProgressBar,
    showConfirmButton: !props.timer,
    toast: true,
    position: 'top-end',
    icon: 'error',
    title,
    text,
    confirmButtonText: props.confirmButtonText,
  }).then((result) => {
    if (result.isConfirmed) {
      emit('confirmed', result)
    }
  })
}

// Warning alert
const showWarning = (title = 'Warning!', text = 'Please be careful.') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: props.confirmButtonText,
  }).then((result) => {
    if (result.isConfirmed) {
      emit('confirmed', result)
    }
  })
}

// Info alert
const showInfo = (title = 'Info', text = 'Here is some information.') => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: props.confirmButtonText,
  }).then((result) => {
    if (result.isConfirmed) {
      emit('confirmed', result)
    }
  })
}

// Confirmation dialog
const showConfirm = (title = 'Are you sure?', text = 'This action cannot be undone.') => {
  return Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: props.confirmButtonText,
    cancelButtonText: props.cancelButtonText,
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      emit('confirmed', result)
    } else if (result.isDismissed) {
      emit('cancelled', result)
    }
  })
}

// Delete confirmation
const showDeleteConfirm = (itemName = 'this item') => {
  return Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: `Do you want to delete ${itemName}? This action cannot be undone.`,
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      emit('confirmed', result)
    } else if (result.isDismissed) {
      emit('cancelled', result)
    }
  })
}

// Loading alert
const showLoading = (title = 'Loading...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
}

// Close current alert
const close = () => {
  Swal.close()
}

// Expose methods to parent components
defineExpose({
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  showDeleteConfirm,
  showLoading,
  close,
})
</script>
